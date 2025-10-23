const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertFavicon() {
  const inputSvg = path.join(__dirname, '..', 'src', 'favicon.svg');
  const outputPng = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');

  try {
    // Ensure public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Convert SVG to 180x180 PNG for Apple touch icon
    await sharp(inputSvg)
      .resize(180, 180)
      .png()
      .toFile(outputPng);

    console.log('✓ Apple touch icon created: apple-touch-icon.png');
  } catch (error) {
    console.error('Error converting favicon:', error);
    process.exit(1);
  }
}

convertFavicon();
