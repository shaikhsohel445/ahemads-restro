// Bundles the NestJS API into a single Workers module.
//
// Why not let Wrangler bundle src/ directly: Nest's dependency injection reads
// `design:paramtypes` metadata that only the TypeScript compiler emits
// (emitDecoratorMetadata). esbuild — which Wrangler uses — strips types
// without emitting it, so every injected constructor would receive
// `undefined`. This script runs each first-party .ts file through
// `ts.transpileModule` (decorator metadata on) inside esbuild, and writes
// dist/worker.js with every dependency bundled in. Wrangler uploads dist/ as
// is (`no_bundle`), with the Prisma query-compiler .wasm as a CompiledWasm
// module next to it.
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const tsconfig = JSON.parse(
  readFileSync(resolve(here, 'tsconfig.json'), 'utf8'),
);

const decoratorMetadata = {
  name: 'ts-decorator-metadata',
  setup(b) {
    b.onLoad({ filter: /\/apps\/api\/src\/.*\.ts$/ }, (args) => {
      const source = readFileSync(args.path, 'utf8');
      const out = ts.transpileModule(source, {
        fileName: args.path,
        compilerOptions: {
          ...tsconfig.compilerOptions,
          module: ts.ModuleKind.ESNext,
          moduleResolution: undefined,
          target: ts.ScriptTarget.ES2022,
          sourceMap: false,
          declaration: false,
          incremental: false,
        },
      });
      return { contents: out.outputText, loader: 'js' };
    });
  },
};

// Prisma's generated client loads its query compiler with
// `import("./query_compiler_fast_bg.wasm?module")`. Keep that import external
// (without the bundler-only `?module` suffix) and put the .wasm next to the
// bundle; wrangler.jsonc's CompiledWasm rule uploads it as a module.
const prismaWasm = {
  name: 'prisma-wasm',
  setup(b) {
    b.onResolve({ filter: /\.wasm\?module$/ }, (args) => {
      const file = resolve(args.resolveDir, args.path.replace(/\?module$/, ''));
      mkdirSync(resolve(here, 'dist'), { recursive: true });
      const name = file.split('/').pop();
      copyFileSync(file, resolve(here, 'dist', name));
      return { path: `./${name}`, external: true };
    });
  },
};

// Optional peer packages Nest probes for with try/require/catch
// (microservices transport, class-transformer metadata storage). They are
// not installed, so resolve them to a module that throws on load: Nest's own
// fallback path then runs exactly as it does under Node.
const optionalPeers = {
  name: 'optional-peers',
  setup(b) {
    b.onResolve(
      {
        filter: /^(@nestjs\/microservices(\/.*)?|class-transformer\/storage)$/,
      },
      (args) => ({ path: args.path, namespace: 'optional-peer' }),
    );
    b.onLoad({ filter: /.*/, namespace: 'optional-peer' }, (args) => ({
      contents: `throw new Error(${JSON.stringify(`Optional package ${args.path} is not bundled`)});`,
      loader: 'js',
    }));
  },
};

// Fonts for PDF exports ship as Wrangler Data modules (an ArrayBuffer at
// runtime) instead of being base64-inlined into the bundle.
const dataFiles = {
  name: 'data-files',
  setup(b) {
    b.onResolve({ filter: /\.ttf$/ }, (args) => {
      const file = resolve(args.resolveDir, args.path);
      const name = file.split('/').pop();
      mkdirSync(resolve(here, 'dist'), { recursive: true });
      copyFileSync(file, resolve(here, 'dist', name));
      return { path: `./${name}`, external: true };
    });
  },
};

await build({
  entryPoints: [resolve(here, 'src/worker.ts')],
  outfile: resolve(here, 'dist/worker.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  // esbuild adds "import" or "require" per call site itself; listing "import"
  // here would hand require() callers (express's router) an ESM namespace.
  conditions: ['workerd', 'worker'],
  mainFields: ['module', 'main'],
  // Resolved by Wrangler / the Workers runtime, not here.
  external: ['cloudflare:*', 'node:*'],
  packages: process.env.BUNDLE_DEPS === '0' ? 'external' : undefined,
  plugins: [optionalPeers, decoratorMetadata, prismaWasm, dataFiles],
  // CommonJS dependencies (all of Nest) `require()` Node built-ins. In an ESM
  // bundle esbuild cannot hoist those, so give the bundle a real `require`
  // for them; nodejs_compat implements node:module's createRequire.
  banner: {
    js: "import { createRequire as __cfCreateRequire } from 'node:module'; const require = __cfCreateRequire('/worker.js');",
  },
  // Nest uses class names for logger contexts and OpenAPI operation ids.
  keepNames: true,
  sourcemap: 'linked',
  logLevel: 'info',
  metafile: false,
});
