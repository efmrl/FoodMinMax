#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({
    html: true  // Enable HTML tags in source
});

// Read the credits markdown file
const creditsPath = path.join(__dirname, '..', 'src', 'credits.md');
const creditsMarkdown = fs.readFileSync(creditsPath, 'utf-8');

// Convert markdown to HTML
const creditsContent = md.render(creditsMarkdown);

// Create just the content that will be loaded into the modal
const html = creditsContent;

// Ensure the public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Write the HTML file
const outputPath = path.join(publicDir, 'credits.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('Credits page generated successfully at', outputPath);
