# api

## Running

Needs a Postgres database. For first start run

```ts
docker run --name postgres-sub-enroll -e POSTGRES_USER=USER -e POSTGRES_PASSWORD=PASSWORD -p 5432:5432 -v /var/lib/data -d postgres
```

Create .env with theses parameters.

```bash
POSTGRES_USER="USER"
POSTGRES_PASSWORD="PASSWORD"
POSTGRES_HOST="127.0.0.1"
POSTGRES_PORT="5432"
POSTGRES_DB="postgres"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
```
