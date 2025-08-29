#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Copy index.html from src to public
cp src/index.html public/

# Sync to cloud
efmrl sync

echo "Deploy complete! Files copied to public/ and synced to cloud."
