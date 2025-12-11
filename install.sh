#!/bin/bash
set -e

# --- Configuration ---
VERSION="${1:-latest}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

# --- Detect Platform ---
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Normalize architecture
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

# --- Define Dependencies Per Platform ---
# Format: "PACKAGE_NAME:VERSION"
# You can add as many packages as you need here.

DEPENDENCIES=()

case "$PLATFORM-$ARCH" in
  linux-x64)
    BINARY_NAME="mcp-linux-x64"
    DEPENDENCIES+=(
      "@libsql/linux-x64-gnu:0.5.22"
      "vscode-ripgrep:1.13.2"  # Example of a second package
    )
    ;;
  linux-arm64)
    BINARY_NAME="mcp-linux-arm64"
    DEPENDENCIES+=(
      "@libsql/linux-arm64-gnu:0.5.22"
      "vscode-ripgrep:1.13.2"
    )
    ;;
  darwin-x64)
    BINARY_NAME="mcp-darwin-x64"
    DEPENDENCIES+=(
      "@libsql/darwin-x64:0.5.22"
      "vscode-ripgrep:1.13.2"
    )
    ;;
  darwin-arm64)
    BINARY_NAME="mcp-darwin-arm64"
    DEPENDENCIES+=(
      "@libsql/darwin-arm64:0.5.22"
      "vscode-ripgrep:1.13.2"
    )
    ;;
  *)
    echo "❌ Unsupported platform: $PLATFORM-$ARCH"
    exit 1
    ;;
esac

# --- Setup Directories ---
echo "setup: $PLATFORM-$ARCH"
mkdir -p "$INSTALL_DIR"
NODE_MODULES_DIR="$INSTALL_DIR/node_modules"

# --- Helper Function: Install NPM Package ---
install_npm_package() {
  local FULL_PKG="$1"
  local PKG_NAME="${FULL_PKG%%:*}" # Extract name (before :)
  local PKG_VER="${FULL_PKG##*:}"  # Extract version (after :)
  local BASE_NAME=$(basename "$PKG_NAME") # e.g. linux-x64-gnu

  local TARGET_DIR="$NODE_MODULES_DIR/$PKG_NAME"
  local TARBALL_URL="https://registry.npmjs.org/${PKG_NAME}/-/${BASE_NAME}-${PKG_VER}.tgz"

  echo "   📦 Fetching $PKG_NAME v$PKG_VER..."
  mkdir -p "$TARGET_DIR"

  if curl -fSL "$TARBALL_URL" | tar -xz -C "$TARGET_DIR" --strip-components=1 2>/dev/null; then
    echo "      ✓ Installed"
  else
    echo "      ❌ Failed to download $PKG_NAME"
    exit 1
  fi
}

# --- 1. Download Main Binary ---
REAL_BINARY="$INSTALL_DIR/mcp.bin"
WRAPPER_SCRIPT="$INSTALL_DIR/mcp"

if [ "$VERSION" = "latest" ]; then
  URL="https://github.com/supervise-dev/mcp/releases/latest/download/${BINARY_NAME}"
else
  URL="https://github.com/supervise-dev/mcp/releases/download/mcp-v${VERSION}/${BINARY_NAME}"
fi

echo "⬇️  Downloading mcp binary..."
curl -fSL --progress-bar -o "$REAL_BINARY" "$URL"
chmod +x "$REAL_BINARY"

# --- 2. Install All Dependencies ---
echo "⬇️  Installing native dependencies..."

for DEP in "${DEPENDENCIES[@]}"; do
  install_npm_package "$DEP"
done

# --- 3. Create Wrapper Script ---
cat > "$WRAPPER_SCRIPT" <<EOF
#!/bin/sh
export NODE_PATH="$NODE_MODULES_DIR"
exec "$REAL_BINARY" "\$@"
EOF

chmod +x "$WRAPPER_SCRIPT"

echo ""
echo "✅ Installed successfully to $WRAPPER_SCRIPT"
