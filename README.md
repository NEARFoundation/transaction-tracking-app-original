# NEAR Transactions Accounting Report

This [React] app was initialized with [create-near-app]

# Quick Start

To run this project locally:

1. Make sure you've installed [Node.js] ≥ 12.
1. Install [Mongo](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) using the instructions in its own section below.
1. `cp .env.development .env.development.local && cp server/.env.development server/.env.development.local`
1. Edit the values for each of those local env files. If you set REACT_APP_ALLOW_DELETING_FROM_DATABASE to "true" in .env.development.local and ALLOW_DELETING_FROM_DATABASE to "true" in server/.env.development.local, you will see a button in the frontend that allows you to delete records from the database, which is useful when you are manually testing whether transaction processing is working after editing the SQL queries.
1. Start Mongo (unless you'll be starting Docker) with something like `brew services start mongodb-community@5.0`.
1. Install PostreSQL:

   ```bash
   brew install postgresql
   brew services start postgresql
   psql postgres
   \du
   CREATE ROLE testuser WITH LOGIN PASSWORD 'secret';
   ALTER ROLE testuser CREATEDB;
   \q
   psql postgres -U testuser
   CREATE DATABASE ttatestdb;
   GRANT ALL PRIVILEGES ON DATABASE tta_test_db TO testuser;
   \list
   \q
   ```

1. Install dependencies for UI and server: `yarn install && cd server && yarn install && cd ..`
1. `pgCreds=___ ./server/test_helpers/updateTestData.sh` (where \_\_\_ is the mainnet Postgres credentials string)
1. `yarn test`
1. Start the server: `yarn serverdev`
1. In a second terminal, start the UI: `yarn dev` (see `package.json` for a full list of `scripts` you can run with `yarn`)

Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.

# Exploring The Code

1. The "backend" code lives in the `/server` folder. See the README there for
   more info.
2. The frontend code lives in the `/src` folder. `/src/index.html` is a great
   place to start exploring. Note that it loads in `/src/index.tsx`, where you
   can learn how the frontend connects to the NEAR blockchain.
3. Tests use [jest](https://jestjs.io/docs/getting-started#using-typescript). You can run via `yarn test`.

# Troubleshooting

## port conflict

If you get an error message about a port conflict, if you're using Docker, try running `docker container ls` and see which containers are active.

Then consider stopping each container via `docker stop {container ID}`, such as `docker stop b72358af5397`. Then try the Quick Start steps above again.

## EPERM

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.

# Other Helpful Docs

- [react](https://reactjs.org/)
- [create-near-app](https://github.com/near/create-near-app)
- [node.js](https://nodejs.org/en/download/package-manager/)
- [near accounts](https://docs.near.org/docs/concepts/account)
- [near wallet](https://wallet.testnet.near.org/)
- [near-cli](https://github.com/near/near-cli)
- [gh-pages](https://github.com/tschaub/gh-pages)

# Old docs about Docker deployments

Docker is not necessary but had been used in the original development of the app.

## Frontend

Preload

    cd docker
    ./prepare.sh

Build Docker image

    ./build.sh

docker/Dockerfile - contains all the commands a user could call on the command line to assemble an image.

Run a new container

    ./run_server.sh

## Backend

Preload

    cd server/docker
    ./prepare.sh

Build Docker image

    ./build.sh

Run a new container

    docker-compose --file docker-compose.yml --project-name api-near-accounting-report up -d

# Setting up Mongo and MongoDB Shell

```
brew install mongodb-community@5.0
brew install mongosh
mongosh
use admin
show databases
db.createUser(
  {
    user: "MongoTestDbUser",
    pwd: "MongoTestDbSecretPhrase",
    roles: [ { role: "readWrite", db: "test" } ]
  }
)
db.createUser(
  {
    user: "MongoDbUser",
    pwd: "MongoDbSecretPhrase",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
show users
exit
```

https://medium.com/@haxzie/getting-started-with-mongodb-setting-up-admin-and-user-accounts-4fdd33687741 was useful.

# Tests

Ensure that server/test_helpers/expectedOutput.csv contains the values that you want. (Ideally we will have more than 1 row per transaction type.) The inputs for server/src/helpers/updateTransactions.test.ts come from that file (transaction hashes and account IDs), and of course so do the expected outputs.

Then run `pgCreds=___ ./server/test_helpers/updateTestData.sh`, but replace `___` with your value for POSTGRESQL_CONNECTION_STRING. This command will download all of the real-world data from the mainnet indexer Postgres database into SQL files that the automated tests will use when seeing your local database (the mock indexer).

Then run `yarn test` to run the tests.
