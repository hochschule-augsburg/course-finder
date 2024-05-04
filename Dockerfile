FROM node:21-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# TODO how to run build only for target
RUN pnpm run -r build
RUN pnpm deploy --filter=api --prod /prod/api

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 2022
# strangly this is not done by the build script
RUN pnpm run db:generate
CMD [ "pnpm", "start" ]

FROM base AS ui
COPY --from=build /usr/src/app/packages/ui/dist /prod/ui
WORKDIR /prod/ui
EXPOSE 3000 
CMD [ "echo", "start" ]