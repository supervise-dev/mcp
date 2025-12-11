.PHONY: help build build-all build-mastra build-linux-x64 build-linux-arm64 build-darwin-x64 build-darwin-arm64 build-client dev-server install clean

SHELL := /bin/bash
DIST_DIR := dist
VERSION := $(shell node -e "console.log(require('./package.json').version)")
GITHUB_REPO := supervise-dev/mcp

help:
	@echo "MCP Build Targets"
	@echo "================="
	@echo ""
	@echo "Build Commands:"
	@echo "  make build                 - Build MCP binary for current platform (Mastra + Bun compile)"
	@echo "  make build-all             - Build all architecture binaries"
	@echo "  make build-linux-x64       - Build Linux x64 binary"
	@echo "  make build-linux-arm64     - Build Linux ARM64 binary"
	@echo "  make build-darwin-x64      - Build macOS x64 binary"
	@echo "  make build-darwin-arm64    - Build macOS ARM64 binary"
	@echo "  make build-mastra          - Run Mastra build only (generates .mastra/output)"
	@echo ""
	@echo "Development:"
	@echo "  make dev                   - Run development server"
	@echo "  make clean                 - Remove build artifacts (.mastra and dist)"
	@echo ""
	@echo "Distribution:"
	@echo "  make install               - Download and install latest binary for current platform"
	@echo "  make install-v<VERSION>    - Download and install specific version"
	@echo ""

# Default build target
build:
	@echo "Building MCP binary..."
	@bun run build
	@echo "✓ Build complete"

# Mastra build only
build-mastra:
	@echo "Running Mastra build..."
	@bun run build:mastra
	@echo "✓ Mastra build complete (.mastra/output generated)"

# Build all binaries
build-all: build-linux-x64 build-linux-arm64 build-darwin-x64 build-darwin-arm64
	@echo "✓ All binaries built successfully"

# Architecture-specific builds
build-linux-x64:
	@echo "Building Linux x64..."
	@bun run build:linux-x64

build-linux-arm64:
	@echo "Building Linux ARM64..."
	@bun run build:linux-arm64

build-darwin-x64:
	@echo "Building macOS x64..."
	@bun run build:darwin-x64

build-darwin-arm64:
	@echo "Building macOS ARM64..."
	@bun run build:darwin-arm64

# Development
dev:
	@echo "Starting development server..."
	@bun run dev

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(DIST_DIR) .mastra
	@echo "✓ Clean complete"

# Release helpers
release-version:
	@echo "MCP v$(VERSION)"

release-tag:
	@echo "mcp-v$(VERSION)"

# Show platform info
platform-info:
	@echo "Platform: $$(uname -s)"
	@echo "Architecture: $$(uname -m)"
	@echo "Node version: $$(node --version)"
	@echo "Bun version: $$(bun --version)"
