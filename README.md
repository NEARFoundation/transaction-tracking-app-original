# NEAR Transaction Tracker App (also known as "Transactions Accounting Report")

Transaction Tracker App (TTA) produces a report that helps teams across the ecosystem to see a simplified view of all transactions over a certain period (e.g. the Finance/Legal/Operations team uses it to reconcile their transactions and stay compliant).

## What it does

Ledgers like https://explorer.near.org don't always provide a simple view of when money changes hands (i.e. NEAR tokens or fungible tokens from one NEAR account to another).

TTA allows you to specify a NEAR mainnet account ID and see a table of all transactions involding the transfer of NEAR tokens or fungible tokens into or out of that account. You can export the table as CSV.

When you specify one or more NEAR acccount IDs, those account IDs get saved to your browser's localStorage. Additionally, the server starts downloading all transactions (from the private indexer) for those account IDs and processes them and saves the data into TTA's Mongo database, which is what powers the table you see in your browser. The downloads can take a while (because the tables are huge), and a cron job keeps track of their progress.

---

# Overview

- The frontend is a React app in the "frontend" folder.
  - `/frontend/src/index.html` is a great place to start exploring. Note that it loads in `/frontend/src/index.tsx`, where you can learn how the frontend connects to the NEAR blockchain.
- The backend is an Express app (with cron jobs and a Mongo database) in the "backend" folder.
  - The backend relies on a private [clone](https://github.com/near/near-indexer-for-explorer/) of the [NEAR Explorer](https://explorer.near.org) indexer, a large PostgreSQL database (certain tables are ~1 TB). We use our own clone of NEAR Explorer (on a bare metal Hetzner server) instead of using the public credentials of the actual NEAR Explorer because the complicated queries take too long and time out.
  - There are also old notes about [Docker](/backend/docker/README.md) even though the team hasn't used it recently.
- There is also a folder called "shared" for code that both apps use.
- Tests use [jest](https://jestjs.io/docs/getting-started#using-typescript). You can run via `yarn test`.

---

# Getting Started

To run this project locally:

1. Make sure you've installed [Node.js] ≥ 18. `nvm use 18`.
1. Install [Mongo](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) using the instructions in its own section below.
1. `cp frontend/.env.development frontend/.env.development.local && cp backend/.env.development backend/.env.development.local`
1. Edit the values for each of those local env files. If you set REACT_APP_ALLOW_DELETING_FROM_DATABASE to "true" in `frontend/.env.development.local` and ALLOW_DELETING_FROM_DATABASE to "true" in `backend/.env.development.local`, you will see a button in the frontend that allows you to delete records from the database, which is useful when you are manually testing whether transaction processing is working after editing the SQL queries.
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
   CREATE DATABASE tta_test_db;
   GRANT ALL PRIVILEGES ON DATABASE tta_test_db TO testuser;
   \list
   \q
   ```

1. Install dependencies for frontend and backend: `yarn install_all`
1. `POSTGRESQL_CONNECTION_STRING=___ ./backend/test_helpers/updateTestData.sh` (where `___` is the mainnet Postgres credentials string)
1. `yarn test`
1. Start the backend: `yarn backend_dev`
1. In a second terminal, start the frontend: `yarn dev` (see `package.json` for a full list of `scripts` you can run with `yarn`)
1. Visit http://localhost:1234/ in the browser.

Go ahead and play with the app and the code. As you make frontend code changes, the app will automatically reload.

## Setting up Mongo and MongoDB Shell

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

`*.test.ts` files live right next to whatever file they are testing.

`backend/src/helpers/updateTransactions.test.ts` contains tests about the complicated SQL queries that process each of the ~40 transaction types.

To test that `updateTransactions` works correctly, first ensure that `backend/test_helpers/expectedOutput.csv` contains the values that you want. (Ideally we will have more than 1 row per transaction type.)

Then run `POSTGRESQL_CONNECTION_STRING=___ ./backend/test_helpers/updateTestData.sh`, but replace `___` with your value for POSTGRESQL_CONNECTION_STRING. This command will download all of the real-world data from the mainnet indexer Postgres database into SQL files that the automated tests will use when seeing your local database (the mock indexer).

To avoid downloading terabytes of data from the remote database (private indexer), the scripts look in `expectedOutput.csv` to see exactly which transaction hashes matter.

The output of `updateTestData.sh` is `backend/test_helpers/internal/testData.sql`, which is how tests can see the local PostgreSQL test database (mock indexer).

The inputs for `backend/src/helpers/updateTransactions.test.ts` come from `expectedOutput.csv` (its transaction hashes and account IDs), and of course so do the expected outputs.

Then run `yarn test` to run the tests.

# Other Helpful Docs

- [react](https://reactjs.org/)
- [create-near-app](https://github.com/near/create-near-app)
- [node.js](https://nodejs.org/en/download/package-manager/)
- [near accounts](https://docs.near.org/docs/concepts/account)
- [near wallet](https://wallet.testnet.near.org/)
- [near-cli](https://github.com/near/near-cli)
- [gh-pages](https://github.com/tschaub/gh-pages)
