#!/bin/bash
set -e

# --- Configuration ---
VERSION="${1:-latest}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
NODE_MODULES_DIR="$INSTALL_DIR/node_modules"

# --- Detect Platform ---
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Normalize for Node/NPM naming conventions
case "$ARCH" in
  x86_64) N_ARCH="x64" ;;
  aarch64|arm64) N_ARCH="arm64" ;;
esac

# --- Define Dependencies ---
# 1. Standard Native Modules (tarball contains the binary)
# 2. Complex Modules (need manual binary download, handled in logic below)
DEPENDENCIES=()

case "$PLATFORM-$N_ARCH" in
  linux-x64)
    BINARY_NAME="mcp-linux-x64"
    DEPENDENCIES+=("@libsql/linux-x64-gnu:0.5.22")
    DEPENDENCIES+=("vscode-ripgrep:1.13.2")
    ;;
  linux-arm64)
    BINARY_NAME="mcp-linux-arm64"
    DEPENDENCIES+=("@libsql/linux-arm64-gnu:0.5.22")
    DEPENDENCIES+=("vscode-ripgrep:1.13.2")
    ;;
  darwin-x64)
    BINARY_NAME="mcp-darwin-x64"
    DEPENDENCIES+=("@libsql/darwin-x64:0.5.22")
    DEPENDENCIES+=("vscode-ripgrep:1.13.2")
    ;;
  darwin-arm64)
    BINARY_NAME="mcp-darwin-arm64"
    DEPENDENCIES+=("@libsql/darwin-arm64:0.5.22")
    DEPENDENCIES+=("vscode-ripgrep:1.13.2")
    ;;
  *)
    echo "❌ Unsupported platform: $PLATFORM-$ARCH"
    exit 1
    ;;
esac

# --- Helper: Install Generic NPM Package ---
install_npm_tarball() {
  local FULL_PKG="$1"
  local PKG_NAME="${FULL_PKG%%:*}"
  local PKG_VER="${FULL_PKG##*:}"
  local BASE_NAME=$(basename "$PKG_NAME")

  local TARGET_DIR="$NODE_MODULES_DIR/$PKG_NAME"
  local TARBALL_URL="https://registry.npmjs.org/${PKG_NAME}/-/${BASE_NAME}-${PKG_VER}.tgz"

  echo "   📦 Fetching JS/Wrapper for $PKG_NAME..."
  mkdir -p "$TARGET_DIR"
  curl -fSL "$TARBALL_URL" | tar -xz -C "$TARGET_DIR" --strip-components=1 2>/dev/null
}

# --- Helper: Post-Install Hooks (The Fix for Ripgrep) ---
run_post_install() {
  local FULL_PKG="$1"
  local PKG_NAME="${FULL_PKG%%:*}"
  local PKG_VER="${FULL_PKG##*:}"

  # SPECIAL HANDLING FOR VSCODE-RIPGREP
  if [ "$PKG_NAME" = "vscode-ripgrep" ]; then
    echo "   ⚙️  Manual Setup: Downloading binary for vscode-ripgrep..."

    local BIN_DIR="$NODE_MODULES_DIR/$PKG_NAME/bin"
    mkdir -p "$BIN_DIR"

    # Map to Microsoft's prebuilt release naming
    # https://github.com/microsoft/ripgrep-prebuilt/releases
    local RG_PLATFORM="$PLATFORM"
    [ "$RG_PLATFORM" = "darwin" ] && RG_PLATFORM="mac" # MS uses 'mac' not 'darwin'

    local RG_URL="https://github.com/microsoft/ripgrep-prebuilt/releases/download/v${PKG_VER}/ripgrep-${RG_PLATFORM}-${N_ARCH}.tar.gz"

    # Download and extract just the 'rg' binary
    if curl -fSL "$RG_URL" | tar -xz -C "$BIN_DIR" 2>/dev/null; then
       # The tar usually contains a folder structure; we might need to move the binary up
       # Or sometimes it extracts strictly 'rg'. Let's ensure it's executable.
       mv "$BIN_DIR/ripgrep-$RG_PLATFORM-$N_ARCH/rg" "$BIN_DIR/rg" 2>/dev/null || true
       chmod +x "$BIN_DIR/rg"
       echo "      ✓ generic ripgrep binary installed"
    else
       echo "      ❌ Failed to download ripgrep binary"
       exit 1
    fi
  fi
}

# --- Main Execution ---

echo "setup: $PLATFORM-$N_ARCH"
mkdir -p "$INSTALL_DIR"

# 1. Download MCP Binary
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

# 2. Install Dependencies
echo "⬇️  Installing dependencies..."
for DEP in "${DEPENDENCIES[@]}"; do
  install_npm_tarball "$DEP"
  run_post_install "$DEP"
done

# 3. Create Wrapper
cat > "$WRAPPER_SCRIPT" <<EOF
#!/bin/sh
export NODE_PATH="$NODE_MODULES_DIR"
exec "$REAL_BINARY" "\$@"
EOF

chmod +x "$WRAPPER_SCRIPT"

echo "✅ Installation complete."
