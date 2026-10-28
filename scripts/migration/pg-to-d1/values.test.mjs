import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConversionError, parsePgArray, toSqlite } from './values.mjs';

test('timestamps become Prisma D1 ISO text in UTC', () => {
  assert.equal(toSqlite('2026-10-28 20:03:14.663', 'timestamp', 'DATETIME'), "'2026-10-28T20:03:14.663+00:00'");
  assert.equal(toSqlite('2026-10-28 20:03:14', 'timestamp', 'DATETIME'), "'2026-10-28T20:03:14.000+00:00'");
  assert.equal(toSqlite('2026-10-28 20:03:14.123456+00', 'timestamptz', 'DATETIME'), "'2026-10-28T20:03:14.123+00:00'");
  assert.throws(() => toSqlite('2026-10-28 20:03:14+05', 'timestamptz', 'DATETIME'), ConversionError);
});

test('dates become midnight UTC', () => {
  assert.equal(toSqlite('2026-02-01', 'date', 'DATETIME'), "'2026-02-01T00:00:00.000+00:00'");
});

test('booleans, numbers and nulls', () => {
  assert.equal(toSqlite('t', 'bool', 'BOOLEAN'), '1');
  assert.equal(toSqlite('f', 'bool', 'BOOLEAN'), '0');
  assert.equal(toSqlite('12.50', 'numeric', 'DECIMAL'), '12.50');
  assert.equal(toSqlite('9007199254740993', 'int8', 'INTEGER'), '9007199254740993');
  assert.equal(toSqlite(null, 'text', 'TEXT'), 'NULL');
  assert.throws(() => toSqlite('abc', 'numeric', 'DECIMAL'), ConversionError);
});

test('arrays become JSON text', () => {
  assert.deepEqual(parsePgArray('{a,"b c","d,e",NULL}'), ['a', 'b c', 'd,e', null]);
  assert.equal(toSqlite('{gluten,nuts}', '_text', 'JSONB'), `'["gluten","nuts"]'`);
  assert.equal(toSqlite('{}', '_text', 'JSONB'), `'[]'`);
  assert.equal(toSqlite('{0,5,6}', '_int4', 'JSONB'), `'[0,5,6]'`);
});

test('json is re-serialised compactly; strings are escaped', () => {
  assert.equal(toSqlite('{"a": 1, "b": "x"}', 'jsonb', 'JSONB'), `'{"a":1,"b":"x"}'`);
  assert.equal(toSqlite("O'Brien — مطعم", 'text', 'TEXT'), "'O''Brien — مطعم'");
});

test('bytea becomes a blob literal', () => {
  assert.equal(toSqlite('\\x00ff10', 'bytea', 'BLOB'), "X'00ff10'");
});
