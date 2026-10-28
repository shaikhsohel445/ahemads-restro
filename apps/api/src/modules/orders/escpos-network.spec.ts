import { probeNetworkPrinter, sendViaNetwork } from './escpos-network';
import { sendToBranchPrinter } from './printer-transport';
import { PrinterNotFoundError, sendRaw } from './escpos-usb';
// The same stub module escpos-network.ts gets for 'cloudflare:sockets'
// (Jest moduleNameMapper).
import { __setConnectBehaviour } from '../../../test/stubs/cloudflare-sockets';

describe('network printer transport (Cloudflare TCP sockets)', () => {
  it('delivers the exact bytes to the printer', async () => {
    let got: Uint8Array = new Uint8Array();
    __setConnectBehaviour({ kind: 'accept', onData: (b) => (got = b) });
    const payload = Buffer.from([0x1b, 0x40, 0x41, 0x42, 0x0a]);
    await sendViaNetwork({ host: 'printer.example.test', port: 9100 }, payload);
    expect(Buffer.from(got).equals(payload)).toBe(true);
  });

  it('reports a refused connection as a clear printer error', async () => {
    __setConnectBehaviour({ kind: 'refuse', message: 'connection refused' });
    await expect(
      sendViaNetwork({ host: 'printer.example.test', port: 9100 }, Buffer.from('x')),
    ).rejects.toThrow(
      /Could not reach the printer at printer\.example\.test:9100.*refused/,
    );
    expect(
      await probeNetworkPrinter({ host: 'printer.example.test', port: 9100 }),
    ).toEqual(expect.objectContaining({ reachable: false }));
  });

  it('refuses network mode with no address instead of falling back to USB', async () => {
    await expect(
      sendToBranchPrinter(
        { printerConnection: 'NETWORK', printerHost: null, printerPort: 9100 },
        Buffer.from('x'),
      ),
    ).rejects.toBeInstanceOf(PrinterNotFoundError);
  });

  it('explains that USB printers are unreachable from Cloudflare', async () => {
    await expect(sendRaw(Buffer.from('x'))).rejects.toThrow(/browser print/);
  });
});
