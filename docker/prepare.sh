#!/bin/bash
rm ./../dist/*.*
rm ./modules/*.*
mkdir -p modules

cd ..
yarn build:web

cp dist/favicon.*.ico docker/modules
cp dist/index.html docker/modules
cp dist/logo*.svg docker/modules
cp dist/src.*.css docker/modules
cp dist/src.*.js docker/modules
cp dist/src.*.map docker/modules

cd docker
