#!/bin/bash

set -e

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build;
else
    npm run build -- -b $CF_PAGES_URL;
fi;