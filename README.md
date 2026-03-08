# course-finder

## Getting Started

### Prerequisites

- Install system dependencies:
    - Docker/PostgreSQL >= 17
    - Node.js >= 24
    - pnpm >= 10
    - pdftk >= 3, poppler-utils (optional, for module book extraction)

- Install npm dependencies:
    ```bash
    pnpm install
    ```
- Copy [`packages/api/.env.sample`](packages/api/.env.sample) to `packages/api/.env` and fill in the required environment variables.
- Create the database container:
    ```bash
    docker run --name docker-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test -v /var/lib/data -p 5432:5432 -d postgres:17-alpine
    ```
- Run database migrations:
    ```bash
    pnpm --filter api db:migrate # migrate schema
    pnpm --filter api db:seed    # seed with default users etc.
    ```

### Running the development server

- Start the development server for both the API and the UI: 
    ```bash
    pnpm -r dev
    ```
- The API server will be available at `http://localhost:8000` and the UI at `http://localhost:3000`.
