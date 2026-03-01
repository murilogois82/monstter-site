#!/bin/bash

# Deploy script for UOL Hosting
# This script builds the project and copies files to public_html

set -e

echo "🚀 Starting UOL deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project
echo "🔨 Building the project..."
pnpm build

# Copy files from docs to public_html
echo "📁 Copying files to public_html..."
if [ -d "public_html" ]; then
  rm -rf public_html/*
else
  mkdir -p public_html
fi

# Copy all files from docs to public_html
cp -r docs/* public_html/

echo "✅ Deployment complete!"
echo "📍 Files deployed to: public_html/"
