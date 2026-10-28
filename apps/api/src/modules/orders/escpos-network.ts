// Raw ESC/POS over TCP (JetDirect / "port 9100") for network thermal printers.
// The API connects out to the printer through Cloudflare's TCP sockets API
// (`cloudflare:sockets`), so the printer's address must be reachable from the
// internet — a printer on the restaurant's private LAN is not. Exposing a
// printer publicly has obvious risks; the browser print buttons are the
// recommended path (docs/cloudflare/MIGRATION-REPORT.md).
import { PrinterNotFoundError } from './escpos-usb';

const CONNECT_TIMEOUT_MS = 4000;
const WRITE_TIMEOUT_MS = 8000;

export interface NetworkPrinterTarget {
  host: string;
  port: number;
}

function describe(target: NetworkPrinterTarget): string {
  return `${target.host}:${target.port}`;
}

function timeout<T>(ms: number, error: () => Error): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(error()), ms));
}

export async function sendViaNetwork(
  target: NetworkPrinterTarget,
  buffer: Buffer,
): Promise<void> {
  const { connect } = await import('cloudflare:sockets');
  let socket: ReturnType<typeof connect>;
  try {
    socket = connect({ hostname: target.host, port: target.port });
    await Promise.race([
      socket.opened,
      timeout(
        CONNECT_TIMEOUT_MS,
        () =>
          new PrinterNotFoundError(
            `Printer at ${describe(target)} did not answer - check it is on, reachable from the internet, and the address is right`,
          ),
      ),
    ]);
  } catch (err) {
    if (err instanceof PrinterNotFoundError) throw err;
    throw new PrinterNotFoundError(
      `Could not reach the printer at ${describe(target)}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  try {
    const writer = socket.writable.getWriter();
    await Promise.race([
      (async () => {
        if (buffer.length) await writer.write(new Uint8Array(buffer));
        await writer.close();
      })(),
      timeout(
        WRITE_TIMEOUT_MS,
        () =>
          new Error(
            `Timed out sending to ${describe(target)} - printer not responding`,
          ),
      ),
    ]);
  } finally {
    await socket.close().catch(() => undefined);
  }
}

/** Opens and closes a connection without sending anything. */
export async function probeNetworkPrinter(
  target: NetworkPrinterTarget,
): Promise<{ reachable: boolean; error: string | null }> {
  try {
    await sendViaNetwork(target, Buffer.alloc(0));
    return { reachable: true, error: null };
  } catch (err) {
    return {
      reachable: false,
      error: err instanceof Error ? err.message : 'Unreachable',
    };
  }
}
