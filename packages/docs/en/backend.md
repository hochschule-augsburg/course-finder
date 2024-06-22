# Backend documentation

The backend consists of a simple REST-like API and serves as the place for the
database schema.

Http communication is done by the node.js library
[**Fastify**](https://www.fastify.io/). From the fastify ecosystem, we use
plugins like [@fastify/jwt](https://github.com/fastify/fastify-jwt) to extend
its base functions.

A central plugin to fastify that is a key architectural component is
[**trpc**](https://trpc.io/) which provides full-stack type safety for out
application while offering great interoperability.

The database schema is defined using [**Prisma**](https://www.prisma.io/), a
modern database toolkit that makes database access easy with an auto-generated
and type-safe query builder. Prisma is also used to define the database schema
in their own domain specific language.

## Project Structure

The project is divided into several directories, each serving a specific
purpose.

1. **`src/domain`**: Business logic divided into domains like assignment or
   mailing.
2. **`src/prisma`**: Helpers for database access and the Prisma schema.
3. **`src/routes`**: trpc-API routes are defined here and are being attached to
   the router. Sometimes when there is the need for non-json apis like
   file-uploads native fastify routes are defined here.
4. **`src/server`**: Everything related to the fastify server.
5. **`src/`**: Globals like main and the env schema.
6. **`tests/`**: Tests and mocks
7. **`prisma/`**: Prisma schema and migrations

## Components

### trpc

Trpc api endpoints are defined from a router instance. In the first object
parameter you can define the name of the endpoint and choose the base-procedure.
In our project we have for example studentOnlyProcedure and adminProcedure which
add authorization to the endpoint.

Next you can add option to you endpoint like input and output validation with
zod and meta information.

At last you have to define the http method like query (GET) or mutation (POST)
and pass the handler for the function.

In this project we also use arrow functions to define the handler for simple
stuff and for more complex stuff we use dedicated files in the `domain/` folder.

```ts
// imported local trpc instances which which add typing and
// simple middlewares
import { adminProcedure, router } from '../../trpc'

export const routes = router({
  // name of your endpoint
  create: adminProcedure // base procedure here adminProcedure: only accessible for admins
    .input(
      // zod input validation
      z.object({
        name: z.string(),
      }),
    )
    // http method like query (GET) or mutation(POST)
    .mutation(async ({ input }) => {}),
})
```

### Prisma

The prisma schema is defined in the `prisma/schema.prisma` file. Here the
database schema is defined in a readable language.

You can migrate the schema to your database with:

```bash
pnpm db:migrate
# or reset with
pnpm db:reset
```

Next this this the database seed is defined in the `prisma/dev-seed.ts` file.
Here is useful data for development and testing. Seeds are loaded with
migrations or with `pnpm db:seed`. There is also a `prod-seed.ts` file for
setting up a production database.

### Tests

Tests are written with [**vitest**](https://vitest.dev/). Look at the
documentation for reference.
