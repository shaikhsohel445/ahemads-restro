// PostgreSQL scalar lists (String[] / Int[]) are JSON arrays on D1, which
// Prisma types as JsonValue. These narrow a stored value back to the array
// the code always wrote, dropping anything that is not of the element type
// rather than trusting it.
export function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];
}

export function numberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((v): v is number => typeof v === 'number')
    : [];
}
