# api

## Running

Needs a Postgres database. For first start run

```bash
docker run --name docker-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 -v /var/lib/data -d postgres:alpine
```

| Command            | Description                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `pnpm db:reset`    | Reset the database. You can add arguments like `-- --download-courses-pdf` to seed with real data |
| `pnpm db:generate` | Generate types after Prisma schema change                                                         |
| `pnpm db:migrate`  | Migrate after Prisma schema change                                                                |

## Deletion Schedule

Student data and all related data will be deleted after one year and eight
months of inactivity every July and December. This does not include course data.
