#!/bin/bash

# Script to deploy the VocabFlash app as a static website

# Build the project
echo "Building project..."
npm run build

# Create docs directory for GitHub Pages
echo "Creating docs directory..."
mkdir -p docs

# Copy static files to docs
echo "Copying static files to docs..."
cp -r dist/public/* docs/

# Create .nojekyll file to disable Jekyll processing
echo "Creating .nojekyll file..."
touch docs/.nojekyll

echo "Static build is ready in the 'docs' directory"
echo "You can now commit and push to GitHub"
echo "Then enable GitHub Pages in your repository settings"
echo "Set the source to 'main' branch and the '/docs' folder"

echo "Alternatively, you can deploy to Netlify or Vercel"
echo "Just point them to your repository and set the publish directory to 'dist/public'"