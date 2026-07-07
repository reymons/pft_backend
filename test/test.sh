#!/bin/sh

set -eu

env_file=.env.test
app_env=test

pnpm test:e2e:run-containers
sleep 4 # wait til all the required services accept connections (TODO: find better approach)
APP_ENV=$app_env node --env-file $env_file ./db/migrate.js
set +e
APP_ENV=$app_env pnpm jest --config ./test/jest-e2e.json
set -e
pnpm test:e2e:stop-containers
