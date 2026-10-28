// Font files are uploaded as Wrangler "Data" modules (see build.mjs and
// wrangler.jsonc), which the Workers runtime exposes as an ArrayBuffer.
declare module '*.ttf' {
  const data: ArrayBuffer;
  export default data;
}
