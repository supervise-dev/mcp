#!/bin/bash

set -e

# Get version - default to latest if not provided
VERSION="${1:-latest}"

# Detect platform and arch
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Normalize architecture names
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64) ARCH="arm64" ;;
  arm64) ARCH="arm64" ;;
esac

# Map to binary name
case "$PLATFORM-$ARCH" in
  linux-x64) BINARY_NAME="mcp-linux-x64" ;;
  linux-arm64) BINARY_NAME="mcp-linux-arm64" ;;
  darwin-x64) BINARY_NAME="mcp-darwin-x64" ;;
  darwin-arm64) BINARY_NAME="mcp-darwin-arm64" ;;
  *)
    echo "❌ Unsupported platform: $PLATFORM-$ARCH"
    exit 1
    ;;
esac

# Default install location
INSTALL_DIR="${INSTALL_DIR:-.}"

mkdir -p "$INSTALL_DIR"

# Determine GitHub URL
if [ "$VERSION" = "latest" ]; then
  echo "⬇️  Downloading latest mcp binary for $PLATFORM-$ARCH..."
  URL="https://github.com/supervise-dev/mcp/releases/latest/download/${BINARY_NAME}"
else
  echo "⬇️  Downloading mcp v${VERSION} for $PLATFORM-$ARCH..."
  URL="https://github.com/supervise-dev/mcp/releases/download/mcp-v${VERSION}/${BINARY_NAME}"
fi

BINARY_PATH="$INSTALL_DIR/mcp"

if curl -fSL --progress-bar -o "$BINARY_PATH" "$URL"; then
  chmod +x "$BINARY_PATH"
  echo ""
  echo "✓ Successfully installed mcp to $BINARY_PATH"
  echo ""
  echo "Usage: $BINARY_PATH"
else
  echo ""
  echo "❌ Failed to download mcp binary"
  exit 1
fi
