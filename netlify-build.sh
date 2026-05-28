#!/usr/bin/env bash
set -euo pipefail

PRODUCTION_BASE_URL="${VITE_PRODUCTION_BASE_URL:-https://duga-backend-c67896e8029c.herokuapp.com/}"
STAGING_BASE_URL="${VITE_STAGING_BASE_URL:-https://api-staging.duga.chat}"
PREVIEW_BASE_URL="${VITE_PREVIEW_BASE_URL:-$STAGING_BASE_URL}"

if [[ "${CONTEXT:-}" == "deploy-preview" ]]; then
  export VITE_APP_ENV="preview"
  export VITE_S3_ENVIRONMENT="preview"
  export VITE_BASE_URL="$PREVIEW_BASE_URL"
elif [[ "${BRANCH:-}" == "staging" || "${CONTEXT:-}" == "branch-deploy" ]]; then
  export VITE_APP_ENV="staging"
  export VITE_S3_ENVIRONMENT="staging"
  export VITE_BASE_URL="$STAGING_BASE_URL"
else
  export VITE_APP_ENV="production"
  export VITE_S3_ENVIRONMENT="production"
  export VITE_BASE_URL="${VITE_BASE_URL:-$PRODUCTION_BASE_URL}"
fi

echo "Netlify build env: CONTEXT=${CONTEXT:-} BRANCH=${BRANCH:-} VITE_APP_ENV=$VITE_APP_ENV VITE_S3_ENVIRONMENT=$VITE_S3_ENVIRONMENT VITE_BASE_URL=$VITE_BASE_URL"
echo "Netlify auth env: VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN:-} VITE_AUTH0_CALLBACK_URL=${VITE_AUTH0_CALLBACK_URL:-} VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE:-}"

npm run build
