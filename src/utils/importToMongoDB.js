const mongoose = require('mongoose');
const mockData = require('./mockData');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');

// Enhanced data with more examples
const enhancedCategories = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Plumbing',
    description: 'Find reliable plumbers for all your plumbing needs, from repairs to installations.',
    icon: 'fas fa-wrench',
    slug: 'plumbing'
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Electrical',
    description: 'Licensed electricians for residential and commercial electrical services.',
    icon: 'fas fa-bolt',
    slug: 'electrical'
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Carpentry',
    description: 'Skilled carpenters for furniture, home repairs, and woodworking projects.',
    icon: 'fas fa-hammer',
    slug: 'carpentry'
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    name: 'Painting',
    description: 'Professional painters for interior and exterior painting services.',
    icon: 'fas fa-paint-roller',
    slug: 'painting'
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    name: 'Cleaning',
    description: 'Cleaning services for homes and businesses, from deep cleaning to regular maintenance.',
    icon: 'fas fa-broom',
    slug: 'cleaning'
  },
  {
    _id: '60d21b4667d0d8992e610c8a',
    name: 'Landscaping',
    description: 'Professional landscapers for garden design, maintenance, and outdoor projects.',
    icon: 'fas fa-leaf',
    slug: 'landscaping'
  },
  {
    _id: '60d21b4667d0d8992e610c8b',
    name: 'Automotive',
    description: 'Expert mechanics for vehicle repairs, maintenance, and custom modifications.',
    icon: 'fas fa-car',
    slug: 'automotive'
  },
  {
    _id: '60d21b4667d0d8992e610c8c',
    name: 'Home Renovation',
    description: 'Specialists in home renovations, remodeling, and improvement projects.',
    icon: 'fas fa-home',
    slug: 'home-renovation'
  }
];

// Enhanced artisans data
const enhancedArtisans = [
  {
    _id: '60d21b4667d0d8992e610c95',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Plumbing Experts',
    description: 'Professional plumbing services with over 10 years of experience. We handle everything from small repairs to complete installations.',
    location: 'New York',
    category: '60d21b4667d0d8992e610c85', // Plumbing
    phone: '123-456-7890',
    featured: true,
    slug: 'plumbing-experts'
  },
  {
    _id: '60d21b4667d0d8992e610c96',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Elite Electricians',
    description: 'Licensed and insured electrical contractors for all your electrical needs. Residential and commercial services available.',
    location: 'Chicago',
    category: '60d21b4667d0d8992e610c86', // Electrical
    phone: '098-765-4321',
    featured: true,
    slug: 'elite-electricians'
  },
  {
    _id: '60d21b4667d0d8992e610c97',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Woodcraft Masters',
    description: 'Custom carpentry work for homes and businesses. From furniture to built-ins, we create beautiful wooden pieces.',
    location: 'Boston',
    category: '60d21b4667d0d8992e610c87', // Carpentry
    phone: '555-123-4567',
    featured: true,
    slug: 'woodcraft-masters'
  },
  {
    _id: '60d21b4667d0d8992e610c98',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Perfect Paint Pro',
    description: 'Interior and exterior painting services with attention to detail. We use premium paints for long-lasting results.',
    location: 'San Francisco',
    category: '60d21b4667d0d8992e610c88', // Painting
    phone: '415-987-6543',
    featured: true,
    slug: 'perfect-paint-pro'
  },
  {
    _id: '60d21b4667d0d8992e610c99',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Sparkling Clean',
    description: 'Residential and commercial cleaning services. Regular maintenance or deep cleaning available for all property types.',
    location: 'Miami',
    category: '60d21b4667d0d8992e610c89', // Cleaning
    phone: '305-555-7890',
    featured: true,
    slug: 'sparkling-clean'
  },
  {
    _id: '60d21b4667d0d8992e610c9a',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Green Gardens',
    description: 'Professional landscaping design and maintenance. We create beautiful outdoor spaces that last throughout the seasons.',
    location: 'Seattle',
    category: '60d21b4667d0d8992e610c8a', // Landscaping
    phone: '206-456-7890',
    featured: false,
    slug: 'green-gardens'
  },
  {
    _id: '60d21b4667d0d8992e610c9b',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Auto Repair Pros',
    description: 'Full-service auto repair shop offering maintenance, repairs, and diagnostics for all vehicle makes and models.',
    location: 'Detroit',
    category: '60d21b4667d0d8992e610c8b', // Automotive
    phone: '313-765-4321',
    featured: false,
    slug: 'auto-repair-pros'
  },
  {
    _id: '60d21b4667d0d8992e610c9c',
    user: '60d21b4667d0d8992e610c92',
    businessName: 'Home Makeover Specialists',
    description: 'Complete home renovation services. From kitchens to bathrooms, we transform your living spaces.',
    location: 'Los Angeles',
    category: '60d21b4667d0d8992e610c8c', // Home Renovation
    phone: '213-555-1234',
    featured: false,
    slug: 'home-makeover-specialists'
  }
];

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bizpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Import categories
    console.log('Importing categories...');
    await Category.deleteMany({}); // Clear existing categories
    await Category.insertMany(enhancedCategories);
    console.log(`${enhancedCategories.length} categories imported`);
    
    // Import users with properly hashed passwords
    console.log('Importing users...');
    await User.deleteMany({}); // Clear existing users
    
    // Hash passwords for all users
    const salt = await bcrypt.genSalt(10);
    const users = await Promise.all(mockData.users.map(async (user) => {
      return {
        ...user,
        password: await bcrypt.hash('password123', salt)
      };
    }));
    
    await User.insertMany(users);
    console.log(`${users.length} users imported`);
    
    // Import artisans
    console.log('Importing artisans...');
    await Artisan.deleteMany({}); // Clear existing artisans
    await Artisan.insertMany(enhancedArtisans);
    console.log(`${enhancedArtisans.length} artisans imported`);
    
    console.log('All data imported successfully');
  } catch (err) {
    console.error('Error importing data:', err);
  }
  
  // Close connection
  mongoose.connection.close();
  console.log('MongoDB connection closed');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 