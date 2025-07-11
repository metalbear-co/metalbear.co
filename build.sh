#!/bin/bash

set -e

if [ "$HUGO_ENVIRONMENT" == "production" ]; then
    npm run build;
else
    npm run build:cf-preview;
fi;
