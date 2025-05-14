const fs = require('fs');
const path = require('path');
const https = require('https');

// Professional stock images for different categories
const categoryImages = {
  'plumbing': [
    'https://images.pexels.com/photos/1824273/pexels-photo-1824273.jpeg',
    'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg',
    'https://images.pexels.com/photos/4115275/pexels-photo-4115275.jpeg'
  ],
  'electrical': [
    'https://images.pexels.com/photos/257886/pexels-photo-257886.jpeg',
    'https://images.pexels.com/photos/159108/light-lamp-electricity-power-159108.jpeg',
    'https://images.pexels.com/photos/3201768/pexels-photo-3201768.jpeg'
  ],
  'carpentry': [
    'https://images.pexels.com/photos/1094770/pexels-photo-1094770.jpeg',
    'https://images.pexels.com/photos/374861/pexels-photo-374861.jpeg',
    'https://images.pexels.com/photos/3637786/pexels-photo-3637786.jpeg'
  ],
  'painting': [
    'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg',
    'https://images.pexels.com/photos/271616/pexels-photo-271616.jpeg',
    'https://images.pexels.com/photos/8134647/pexels-photo-8134647.jpeg'
  ],
  'cleaning': [
    'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg',
    'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg',
    'https://images.pexels.com/photos/4239035/pexels-photo-4239035.jpeg'
  ]
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Download image function
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(uploadsDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      // Delete existing file to redownload
      fs.unlinkSync(filepath);
    }

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
};

// Download all images
async function setupProfileImages() {
  try {
    console.log('Setting up profile images...');
    
    for (const [category, urls] of Object.entries(categoryImages)) {
      console.log(`\nDownloading ${category} images:`);
      
      for (let i = 0; i < urls.length; i++) {
        const filename = `${category}-${i + 1}.jpg`;
        await downloadImage(urls[i], filename);
      }
    }

    console.log('\nAll images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Export for use in other files
module.exports = setupProfileImages;

// Run if called directly
if (require.main === module) {
  setupProfileImages();
} 