#!/usr/bin/env bash
# End-to-end check of the PostgreSQL -> D1 migration on this machine, with no
# Cloudflare account: a throwaway PostgreSQL (port 55439) gets the original
# 38 migrations plus test/fixture.sql, which is then exported, transformed,
# imported into a separate local D1/R2 state directory and validated.
#
#   PG_BIN=/usr/local/opt/postgresql@14/bin scripts/migration/test/run-local.sh
#
# Requires PostgreSQL 14+ server binaries and Node 22.13+. Leaves everything in
# $WORK (default: ./.migration-test) for inspection; never touches the dev D1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WORK="${WORK:-$ROOT/.migration-test}"
PG_BIN="${PG_BIN:-$(dirname "$(command -v pg_ctl)")}"
PORT=55439
SOCK="/tmp/orpg-test"

rm -rf "$WORK" && mkdir -p "$WORK" "$SOCK"
"$PG_BIN/initdb" -D "$WORK/pgdata" -U postgres --auth=trust >/dev/null
"$PG_BIN/pg_ctl" -D "$WORK/pgdata" -o "-p $PORT -k $SOCK -c listen_addresses=''" -l "$WORK/pg.log" start >/dev/null
trap '"$PG_BIN/pg_ctl" -D "$WORK/pgdata" stop -m fast >/dev/null' EXIT
sleep 2
PSQL=("$PG_BIN/psql" -q -v ON_ERROR_STOP=1 -h "$SOCK" -p $PORT -U postgres)
"${PSQL[@]}" -c "CREATE DATABASE orderrestro_src"
while IFS= read -r m; do
  "${PSQL[@]}" -d orderrestro_src -f "$m" >/dev/null
done < <(find "$ROOT/apps/api/prisma/pg-migrations-reference" -name migration.sql | sort)
"${PSQL[@]}" -d orderrestro_src -f "$ROOT/scripts/migration/test/fixture.sql"

cd "$ROOT/scripts/migration"
SOURCE_DATABASE_URL="postgresql://postgres@localhost:$PORT/orderrestro_src?host=$SOCK" \
  node pg-to-d1/export-postgres.mjs --out "$WORK/export" >/dev/null
node pg-to-d1/transform.mjs --export "$WORK/export" --out "$WORK/d1-import"
(cd "$ROOT/apps/api" && pnpm exec wrangler d1 migrations apply DB --local --persist-to "$WORK/state" >/dev/null)
node pg-to-d1/import.mjs --dir "$WORK/d1-import" --local --persist-to "$WORK/state" >/dev/null
node pg-to-d1/validate.mjs --export "$WORK/export" --dir "$WORK/d1-import" --local --persist-to "$WORK/state"
echo "Migrated state in $WORK/state — run the API on it with:"
echo "  (cd apps/api && pnpm exec wrangler dev --persist-to $WORK/state)   # login owner@fixture.test / Password123!"
