#!/bin/sh
set -eu
cd "$(dirname "$0")"
exec node scripts/test-news.mjs "$@"
