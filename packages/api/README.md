# api

## Running

Needs a Postgres database. For first start run

```ts
docker run --name postgres-docker -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 5432:5432 -v /var/lib/data -d postgres:alpine
```
