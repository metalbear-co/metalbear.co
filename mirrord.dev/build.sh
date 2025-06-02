#!/bin/bash

set -e

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build -- -e production
else
    npm run build -- -b $CF_PAGES_URL/mirrord
fi;

npx pagefind --site public/docs --output-path public/pagefind
