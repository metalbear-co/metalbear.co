#!/bin/bash

set -e

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build:with-subsite;
else
    npm run build:with-subsite -- -b $CF_PAGES_URL;
fi;
