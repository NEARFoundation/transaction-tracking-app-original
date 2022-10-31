
# Run this file via `yarn seed`.

psql -Atx $POSTGRESQL_CONNECTION_STRING -af backend/data/seedData.sql
