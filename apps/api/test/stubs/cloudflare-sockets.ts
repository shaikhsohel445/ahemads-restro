// Jest stand-in for `cloudflare:sockets`. Tests drive it through
// `__setConnectBehaviour` to simulate a printer that accepts bytes or refuses
// the connection.
type Behaviour =
  | { kind: 'accept'; onData: (bytes: Uint8Array) => void }
  | { kind: 'refuse'; message: string };

let behaviour: Behaviour = { kind: 'refuse', message: 'no behaviour set' };

export function __setConnectBehaviour(next: Behaviour) {
  behaviour = next;
}

export function connect(_address: { hostname: string; port: number }) {
  const current = behaviour;
  const chunks: Uint8Array[] = [];
  const opened =
    current.kind === 'accept'
      ? Promise.resolve({})
      : Promise.reject(new Error(current.message));
  opened.catch(() => undefined);
  return {
    opened,
    closed: Promise.resolve(),
    readable: new ReadableStream<Uint8Array>(),
    writable: new WritableStream<Uint8Array>({
      write(chunk) {
        chunks.push(chunk);
      },
      close() {
        if (current.kind === 'accept') {
          const total = chunks.reduce((n, c) => n + c.length, 0);
          const all = new Uint8Array(total);
          let o = 0;
          for (const c of chunks) {
            all.set(c, o);
            o += c.length;
          }
          current.onData(all);
        }
      },
    }),
    close: () => Promise.resolve(),
  };
}
