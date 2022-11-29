#!/bin/bash

#build step with initial tag
docker build ./ -t nearfoundation/txtrackingbackend:develop -f ./docker/backend/Dockerfile

#tag step
docker tag nearfoundation/txtrackingbackend:develop 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/txtrackingbackend:develop

# push to ecr step (requires login using cloudops/ecr_login.sh)
docker push 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/txtrackingbackend:develop
