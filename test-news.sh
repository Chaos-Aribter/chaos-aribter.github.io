#!/bin/sh
set -eu
cd "$(dirname "$0")"
case "${1:-}" in
  --help|-h) echo '用法：sh test-news.sh [稿件目录或 article.md] [--build-only]'; exit 0 ;;
esac
for arg in "$@"; do
  case "$arg" in
    --build-only) ;;
    -*) echo "不支持的参数：${arg}（仅校验请使用 generate-news.sh --check）" >&2; exit 1 ;;
  esac
done
node scripts/news-release-state.mjs invalidate
node scripts/generate-news.mjs "$@"
node scripts/news-release-state.mjs record
for arg in "$@"; do
  if [ "$arg" = '--build-only' ]; then exit 0; fi
done
# Always preview this project's generated output.
unset NEWS_PREVIEW_DIR
node scripts/preview-news.mjs
