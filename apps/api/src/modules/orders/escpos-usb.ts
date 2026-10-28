// USB thermal printing — not available on Cloudflare.
//
// The self-hosted build wrote ESC/POS bytes straight to a printer plugged into
// the machine running the backend (kernel usblp device, libusb fallback). A
// Worker runs in Cloudflare's network with no devices attached, so this
// transport cannot exist there. Receipts and kitchen tickets still print from
// the browser (the "Print" buttons load the HTML receipt/KOT and call the
// browser's print dialog, which reaches any printer the till's OS can see),
// and NETWORK printers reachable from the internet still work server-side
// (escpos-network.ts). The original implementation is kept for reference in
// prisma/pg-migrations-reference/escpos-usb.self-hosted-reference.ts.txt.

export class PrinterNotFoundError extends Error {
  code = 'PRINTER_NOT_FOUND';
  constructor(message: string) {
    super(message);
    this.name = 'PrinterNotFoundError';
  }
}

export const USB_UNAVAILABLE =
  'USB printers cannot be reached from the cloud server. Use the browser print ' +
  'buttons (they print to any printer the till can see), or switch the branch ' +
  'to a network printer the server can reach in Settings > Printer.';

/** No device nodes exist on Workers. */
export function probeCharDevices(): Promise<string[]> {
  return Promise.resolve([]);
}

/** No USB bus exists on Workers. */
export function findPrinterDescriptor(): {
  vendorId: number;
  productId: number;
  id: string;
} | null {
  return null;
}

export function sendRaw(_buffer: Buffer): Promise<void> {
  return Promise.reject(new PrinterNotFoundError(USB_UNAVAILABLE));
}
