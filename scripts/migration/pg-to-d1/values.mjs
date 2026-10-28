// PostgreSQL text values -> SQLite literals in the exact form Prisma's D1
// adapter writes, so migrated rows are indistinguishable from rows the app
// created itself:
//   DateTime  TEXT  2026-10-28T20:03:14.663+00:00
//   Decimal   number literal (REAL/INTEGER affinity)
//   Boolean   0 / 1
//   Json, String[] / Int[]  TEXT JSON
//   Bytes     BLOB  X'..'
// Anything that cannot be converted faithfully throws (the transform reports
// the row) instead of being coerced into a misleading value.

export class ConversionError extends Error {}

export function sqlString(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function isoUtc(datePart, timePart = '00:00:00') {
  const [hms, fracRaw = ''] = timePart.split('.');
  const ms = (fracRaw + '000').slice(0, 3);
  const iso = `${datePart}T${hms}.${ms}+00:00`;
  if (Number.isNaN(Date.parse(iso))) throw new ConversionError(`invalid timestamp ${datePart} ${timePart}`);
  return iso;
}

/** Parses a PostgreSQL array literal like {a,"b c",NULL} (one dimension). */
export function parsePgArray(text) {
  if (Array.isArray(text)) return text; // already parsed by the driver
  if (text === '{}') return [];
  if (!text.startsWith('{') || !text.endsWith('}')) throw new ConversionError(`not an array literal: ${text}`);
  const body = text.slice(1, -1);
  const out = [];
  let i = 0;
  while (i <= body.length) {
    if (body[i] === '"') {
      let v = '';
      i++;
      while (i < body.length && body[i] !== '"') {
        if (body[i] === '\\') i++;
        v += body[i++];
      }
      i++; // closing quote
      out.push(v);
    } else {
      let j = body.indexOf(',', i);
      if (j === -1) j = body.length;
      const raw = body.slice(i, j);
      out.push(raw === 'NULL' ? null : raw);
      i = j;
    }
    if (body[i] === ',') i++;
    else if (i >= body.length) break;
    if (body[i] === '{') throw new ConversionError('multi-dimensional arrays are not supported');
  }
  return out;
}

/**
 * @param value  text from PostgreSQL (or null)
 * @param udt    PostgreSQL udt_name of the source column
 * @param target SQLite declared type of the target column
 * @returns SQL literal
 */
export function toSqlite(value, udt, target) {
  if (value === null || value === undefined) return 'NULL';
  switch (udt) {
    case 'bool':
      if (value === 't' || value === 'true') return '1';
      if (value === 'f' || value === 'false') return '0';
      throw new ConversionError(`invalid boolean ${value}`);
    case 'int2':
    case 'int4':
    case 'int8':
      if (!/^-?\d+$/.test(value)) throw new ConversionError(`invalid integer ${value}`);
      return value;
    case 'numeric':
    case 'float4':
    case 'float8': {
      if (!/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(value)) throw new ConversionError(`invalid number ${value}`);
      // Keep the exact decimal text; SQLite parses it into the column.
      return value;
    }
    case 'timestamp':
    case 'timestamptz': {
      const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d+)?)(?:([+-]\d{2})(?::?(\d{2}))?|Z)?$/.exec(value);
      if (!m) throw new ConversionError(`invalid timestamp ${value}`);
      if (m[3] && m[3] !== '+00' && m[3] !== '-00') {
        // Export runs with TIME ZONE 'UTC'; anything else means a misconfigured export.
        throw new ConversionError(`timestamp not in UTC: ${value}`);
      }
      return sqlString(isoUtc(m[1], m[2]));
    }
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ConversionError(`invalid date ${value}`);
      return sqlString(isoUtc(value));
    case 'json':
    case 'jsonb':
      return sqlString(JSON.stringify(JSON.parse(value)));
    case '_text':
    case '_varchar':
      return sqlString(JSON.stringify(parsePgArray(value)));
    case '_int2':
    case '_int4':
    case '_int8':
      return sqlString(
        JSON.stringify(
          parsePgArray(value).map((v) => {
            if (v === null || !/^-?\d+$/.test(v)) throw new ConversionError(`invalid int array ${value}`);
            return Number(v);
          }),
        ),
      );
    case 'bytea': {
      const hex = value.startsWith('\\x') ? value.slice(2) : null;
      if (hex === null || !/^[0-9a-fA-F]*$/.test(hex)) throw new ConversionError('bytea not in hex form');
      return `X'${hex}'`;
    }
    default:
      if (udt.startsWith('_')) throw new ConversionError(`unsupported array type ${udt}`);
      // text, varchar, bpchar, uuid and enum types
      if (/^(INTEGER|REAL|DECIMAL|BOOLEAN)$/.test(target)) {
        throw new ConversionError(`text value for ${target} column`);
      }
      return sqlString(value);
  }
}
