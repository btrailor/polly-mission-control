#!/bin/bash
# Post-build script to fix GitHub Pages routing for static export
# Converts /agents.html to /agents/index.html so GitHub Pages serves it at /agents

echo "Fixing routes for GitHub Pages..."

cd "$(dirname "$0")/../dist"

# For each .html file (except index.html and 404.html), create a folder with index.html
for file in *.html; do
  if [ "$file" != "index.html" ] && [ "$file" != "404.html" ]; then
    folder="${file%.html}"
    mkdir -p "$folder"
    cp "$file" "$folder/index.html"
    echo "  $file → $folder/index.html"
  fi
done

echo "Done!"
