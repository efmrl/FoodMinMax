#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Copy files from src to public
cp src/index.html public/
cp src/foodOptimizer.js public/

# Sync to cloud
efmrl sync -D

echo "Deploy complete! Files copied to public/ and synced to cloud."
