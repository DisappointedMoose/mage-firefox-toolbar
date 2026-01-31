#!/bin/bash

# Build script for DisappointedMage Firefox Toolbar
# Creates a zip file ready for Firefox Add-ons submission

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
VERSION=$(grep -o '"version": "[^"]*"' "$SCRIPT_DIR/manifest.json" | cut -d'"' -f4)
ZIP_NAME="disappointedmage-firefox-toolbar-v${VERSION}.zip"

echo "Building DisappointedMage Firefox Toolbar v${VERSION}..."

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Remove old zip if exists
rm -f "$DIST_DIR/$ZIP_NAME"

# Create zip, excluding development files
cd "$SCRIPT_DIR"
zip -r "$DIST_DIR/$ZIP_NAME" . \
    -x ".idea/*" \
    -x ".claude/*" \
    -x "CLAUDE.md" \
    -x "README.md" \
    -x ".git/*" \
    -x ".gitignore" \
    -x "dist/*" \
    -x "build.sh" \
    -x "screenshots/*" \
    -x "*.zip"

echo ""
echo "✅ Build complete: dist/$ZIP_NAME"
echo ""
ls -lh "$DIST_DIR/$ZIP_NAME"
