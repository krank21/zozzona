#!/usr/bin/env sh

# Load Husky env
. "$(dirname "$0")/_/husky.sh"

# Fix npm PATH for Homebrew, nvm, and system Node
NODE_PATH="$(which node 2>/dev/null | xargs dirname)"
export PATH="$NODE_PATH:/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🔓 Unpacking after commit..."
npm run unpack || exit 0
