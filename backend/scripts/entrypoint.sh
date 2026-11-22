#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for PostgreSQL ($DB_HOST:$DB_PORT)..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "PostgreSQL is ready."

if [ "$SKIP_MIGRATIONS" = "true" ] || [ "$SKIP_MIGRATIONS" = "1" ]; then
  echo "Skipping database migrations (SKIP_MIGRATIONS=$SKIP_MIGRATIONS)."
else
  echo "Applying database migrations..."
  python manage.py migrate --noinput
fi

exec "$@"
