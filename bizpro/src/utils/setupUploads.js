const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads');
const imagesDir = path.join(__dirname, '../../public/images');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
  }
  
  // Set directory permissions
  fs.chmodSync(uploadsDir, 0o755);
  fs.chmodSync(imagesDir, 0o755);
  
  console.log('Upload directories setup completed successfully');
} catch (error) {
  console.error('Error setting up upload directories:', error);
} 