// ZATCA (Saudi Zakat, Tax and Customs Authority) e-invoicing — the QR code
// required on a *simplified* tax invoice (B2C receipt) since Phase 1
// ("Generation", 4 Dec 2021): a Base64 string of TLV-encoded fields
//   1 seller name, 2 VAT registration number, 3 invoice timestamp (ISO 8601),
//   4 invoice total incl. VAT, 5 VAT total.
//
// This covers Phase 1 only. Phase 2 ("Integration") additionally requires
// a UBL 2.1 XML invoice, a cryptographic stamp from a ZATCA-issued CSID, the
// invoice hash chain and real-time reporting to the Fatoora platform. That
// is NOT implemented here — see docs/cloudflare/SAUDI-LOCALIZATION.md.

export interface ZatcaQrFields {
  sellerName: string;
  vatNumber: string;
  /** Invoice issue time; serialised as ISO 8601 UTC. */
  timestamp: Date | string;
  /** Total including VAT. */
  total: number;
  vatTotal: number;
}

function tlv(tag: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  if (bytes.length > 255) throw new Error(`ZATCA TLV field ${tag} is longer than 255 bytes`);
  return [tag, bytes.length, ...bytes];
}

export function zatcaQrBase64(f: ZatcaQrFields): string {
  const ts = new Date(f.timestamp).toISOString().replace(/\.\d{3}Z$/, "Z");
  const bytes = [
    ...tlv(1, f.sellerName),
    ...tlv(2, f.vatNumber),
    ...tlv(3, ts),
    ...tlv(4, f.total.toFixed(2)),
    ...tlv(5, f.vatTotal.toFixed(2)),
  ];
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** Parses a ZATCA TLV QR back into its fields (tests and verification). */
export function decodeZatcaQr(base64: string): Record<number, string> {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const out: Record<number, string> = {};
  let i = 0;
  while (i < bytes.length) {
    const tag = bytes[i];
    const len = bytes[i + 1];
    out[tag] = new TextDecoder().decode(bytes.slice(i + 2, i + 2 + len));
    i += 2 + len;
  }
  return out;
}

/** Saudi VAT registration numbers are 15 digits, starting and ending with 3. */
export function isSaudiVatNumber(value: string): boolean {
  return /^3\d{13}3$/.test(value.trim());
}
