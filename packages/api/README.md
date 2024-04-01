# api

## Running

Needs a Postgres database. For first start run

```ts
docker run --name postgres-sub-enroll -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 5432:5432 -v /var/lib/data -d $POSTGRES_DB
```

Create .env with theses parameters.

```bash
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
```

## Services

Following env must be set in order to run the app in production:

```
LDAP_URL
LDAP_BASE_DN
```

For local development these can be mocked with `MOCK_SERVICES` env.
