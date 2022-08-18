near-accounting-report
==================

This [React] app was initialized with [create-near-app]


Quick Start
===========

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12 and [Docker](https://docs.docker.com/get-docker/)
1. `cp .env.local.example .env.local` and `cp .env.development.local.example .env.development.local` and then edit their values.
1. Install dependencies: `yarn install`
1. Run the local development server: `yarn dev` (see `package.json` for a full list of `scripts` you can run with `yarn`)

Now you'll have a local development environment backed by the NEAR TestNet!

Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.

Docker Deploys
==================
Frontend
------------------
Preload

    cd docker
    ./prepare.sh

Build Docker image

    ./build.sh

docker/Dockerfile - contains all the commands a user could call on the command line to assemble an image.

Run a new container

    ./run_server.sh

Backend
------------------
Preload

    cd server/docker
    ./prepare.sh

Build Docker image

    ./build.sh

Run a new container

    docker-compose --file docker-compose.mainnet.yml --project-name api-near-accounting-report up -d


Exploring The Code
==================

1. The "backend" code lives in the `/server` folder. See the README there for
   more info.
2. The frontend code lives in the `/src` folder. `/src/index.html` is a great
   place to start exploring. Note that it loads in `/src/index.js`, where you
   can learn how the frontend connects to the NEAR blockchain.
3. Tests: there are different kinds of tests for the frontend and the backend
   See `server/README` for info about how it's tested. The frontend code gets
   tested with [jest]. You can run both of these at once with `yarn run test`.



Troubleshooting
===============

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


[React]: https://reactjs.org/
[create-near-app]: https://github.com/near/create-near-app
[Node.js]: https://nodejs.org/en/download/package-manager/
[jest]: https://jestjs.io/
[NEAR accounts]: https://docs.near.org/docs/concepts/account
[NEAR Wallet]: https://wallet.testnet.near.org/
[near-cli]: https://github.com/near/near-cli
[gh-pages]: https://github.com/tschaub/gh-pages
