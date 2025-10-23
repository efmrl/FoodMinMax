#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Build everything (CSS and favicon)
npm run build

# Copy files from src to public
cp src/index.html public/
cp src/foodOptimizer.js public/
cp src/favicon.svg public/

# Sync to cloud
efmrl sync -D

echo "Deploy complete! Files copied to public/ and synced to cloud."
