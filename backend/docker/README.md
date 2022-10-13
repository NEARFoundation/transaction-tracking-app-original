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

## Backend (Data Collector and API server)

Preload

    cd backend/docker
    ./prepare.sh

Build Docker image

    ./build.sh

Run a new container

    docker-compose --file docker-compose.yml --project-name api-near-accounting-report up -d

1. Run the MongoDB server `docker-compose up -d`
2. Install dependencies: `yarn install`
3. Run the API server: `yarn dev`

# Troubleshooting

## port conflict

If you get an error message about a port conflict, if you're using Docker, try running `docker container ls` and see which containers are active.

Then consider stopping each container via `docker stop {container ID}`, such as `docker stop b72358af5397`. Then try the Quick Start steps above again.

## EPERM

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.
