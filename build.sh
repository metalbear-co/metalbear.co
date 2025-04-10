#!/bin/bash

set -e

cd mirrord.dev
./build.sh
cd ..

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build;
else
    npm run build -- -b $CF_PAGES_URL;
fi;

mv mirrord.dev/public ./public/mirrord
