#!/bin/bash
set -e

# --- Configuration ---
VERSION="${1:-latest}"

# 1. BIN_DIR: Where the 'mcp' command user types goes (clean)
BIN_DIR="${INSTALL_DIR:-/usr/local/bin}"

# 2. LIB_DIR: Where the messy binaries and node_modules go (hidden)
if [ -w "/usr/local/lib" ]; then
  LIB_DIR="/usr/local/lib/mcp"
else
  LIB_DIR="$HOME/.local/share/mcp"
fi

# Override LIB_DIR if explicitly set
LIB_DIR="${CUSTOM_LIB_PATH:-$LIB_DIR}"

# --- Detect Platform ---
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) N_ARCH="x64" ;;
  aarch64|arm64) N_ARCH="arm64" ;;
esac

case "$PLATFORM-$N_ARCH" in
  linux-x64) BINARY_NAME="mcp-linux-x64" ;;
  linux-arm64) BINARY_NAME="mcp-linux-arm64" ;;
  darwin-x64) BINARY_NAME="mcp-darwin-x64" ;;
  darwin-arm64) BINARY_NAME="mcp-darwin-arm64" ;;
  *)
    echo "❌ Unsupported platform: $PLATFORM-$ARCH"
    exit 1
    ;;
esac

# --- Main Execution ---
echo "setup: $PLATFORM-$N_ARCH"
echo "  - Binaries: $LIB_DIR"
echo "  - Command:  $BIN_DIR/mcp"

# Create directories
mkdir -p "$BIN_DIR"
mkdir -p "$LIB_DIR"

# 1. Download MCP Binary
REAL_BINARY="$LIB_DIR/mcp.bin"
WRAPPER_SCRIPT="$BIN_DIR/mcp"

if [ "$VERSION" = "latest" ]; then
  URL="https://github.com/supervise-dev/mcp/releases/latest/download/${BINARY_NAME}"
else
  URL="https://github.com/supervise-dev/mcp/releases/download/mcp-v${VERSION}/${BINARY_NAME}"
fi

echo "⬇️  Downloading mcp binary..."
curl -fSL --progress-bar -o "$REAL_BINARY" "$URL"
chmod +x "$REAL_BINARY"

# 2. Use the binary as Bun to install dependencies
echo "⬇️  Installing dependencies..."
cd "$LIB_DIR"

# Create a minimal package.json for dependencies
cat > package.json <<EOF
{
  "name": "mcp-dependencies",
  "private": true,
  "dependencies": {
    "@libsql/linux-x64-gnu": "0.5.22",
    "@libsql/linux-arm64-gnu": "0.5.22",
    "@libsql/darwin-x64": "0.5.22",
    "@libsql/darwin-arm64": "0.5.22",
    "vscode-ripgrep": "1.13.2"
  },
  "trustedDependencies": [
    "vscode-ripgrep"
  ]
}
EOF

# Use the downloaded binary as Bun to install packages
# vscode-ripgrep's postinstall will download the ripgrep binary automatically
BUN_BE_BUN=1 "$REAL_BINARY" install --no-save

# 3. Create wrapper script
cat > "$WRAPPER_SCRIPT" <<EOF
#!/bin/sh
export NODE_PATH="$LIB_DIR/node_modules"
exec "$REAL_BINARY" "\$@"
EOF

chmod +x "$WRAPPER_SCRIPT"

echo "✅ Installed successfully."
