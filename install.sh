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

# --- Helper: Post-Install Hooks (UPDATED & FIXED) ---
run_post_install() {
  local FULL_PKG="$1"
  local PKG_NAME="${FULL_PKG%%:*}"

  # SPECIAL HANDLING FOR VSCODE-RIPGREP
  if [ "$PKG_NAME" = "vscode-ripgrep" ]; then
    echo "   ⚙️  Manual Setup: Downloading official ripgrep binary..."

    local BIN_DIR="$NODE_MODULES_DIR/$PKG_NAME/bin"
    mkdir -p "$BIN_DIR"

    # 1. Hardcode underlying 'ripgrep' version to 13.0.0 (Matches vscode-ripgrep 1.13.x era)
    local RG_VERSION="13.0.0"

    # 2. Map platform/arch to Rust target names correctly
    local RUST_TARGET=""
    if [ "$PLATFORM" = "linux" ]; then
       if [ "$N_ARCH" = "x64" ]; then RUST_TARGET="x86_64-unknown-linux-musl"; fi
       if [ "$N_ARCH" = "arm64" ]; then RUST_TARGET="aarch64-unknown-linux-gnu"; fi
    elif [ "$PLATFORM" = "darwin" ]; then
       if [ "$N_ARCH" = "x64" ]; then RUST_TARGET="x86_64-apple-darwin"; fi
       if [ "$N_ARCH" = "arm64" ]; then RUST_TARGET="aarch64-apple-darwin"; fi
    fi

    if [ -z "$RUST_TARGET" ]; then
        echo "      ❌ Could not determine Rust target for $PLATFORM-$N_ARCH"
        exit 1
    fi

    # 3. Download from official BurntSushi/ripgrep releases (Stable URLs)
    local RG_URL="https://github.com/BurntSushi/ripgrep/releases/download/${RG_VERSION}/ripgrep-${RG_VERSION}-${RUST_TARGET}.tar.gz"

    if curl -fSL "$RG_URL" | tar -xz -C "$BIN_DIR" 2>/dev/null; then
       # Find the binary inside the extracted folder and move it to ./bin/rg
       find "$BIN_DIR" -name "rg" -type f -exec mv {} "$BIN_DIR/rg" \;
       chmod +x "$BIN_DIR/rg"

       # Cleanup empty folders
       find "$BIN_DIR" -type d -empty -delete 2>/dev/null || true

       echo "      ✓ Official ripgrep v${RG_VERSION} installed"
    else
       echo "      ❌ Failed to download ripgrep binary from $RG_URL"
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
