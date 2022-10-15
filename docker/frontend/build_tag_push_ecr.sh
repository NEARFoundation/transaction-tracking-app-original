#!/bin/bash

#build step with initial tag
docker build ./ -t nearfoundation/txtrackingfrontend:develop -f ./docker/frontend/Dockerfile

#tag step
docker tag  nearfoundation/txtrackingfrontend:develop 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/txtrackingfrontend:develop

# push to ecr step (requires login using cloudops/ecr_login.sh)
docker push 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/txtrackingfrontend:develop
