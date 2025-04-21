#!/bin/bash

set -e

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build:with-subsite;
else
    HUGO_BASE_URL=$CF_PAGES_URL npm run build:with-subsite;
fi;
