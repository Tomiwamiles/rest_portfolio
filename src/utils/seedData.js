const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Artisan = require('../models/Artisan');

// Seed categories
const seedCategories = async () => {
  try {
    // Check if categories already exist
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount > 0) {
      console.log('Categories already exist, skipping seed');
      return;
    }

    const categories = [
      {
        name: 'Plumbing',
        description: 'Find reliable plumbers for all your plumbing needs, from repairs to installations.',
        icon: 'fas fa-wrench',
        slug: 'plumbing'
      },
      {
        name: 'Electrical',
        description: 'Licensed electricians for residential and commercial electrical services.',
        icon: 'fas fa-bolt',
        slug: 'electrical'
      },
      {
        name: 'Carpentry',
        description: 'Skilled carpenters for furniture, home repairs, and woodworking projects.',
        icon: 'fas fa-hammer',
        slug: 'carpentry'
      },
      {
        name: 'Painting',
        description: 'Professional painters for interior and exterior painting services.',
        icon: 'fas fa-paint-roller',
        slug: 'painting'
      },
      {
        name: 'Cleaning',
        description: 'Cleaning services for homes and businesses, from deep cleaning to regular maintenance.',
        icon: 'fas fa-broom',
        slug: 'cleaning'
      }
    ];

    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Check if users already exist
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@bizpro.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Customer User',
        email: 'customer@bizpro.com',
        password: hashedPassword,
        role: 'customer'
      },
      {
        name: 'Artisan User',
        email: 'artisan@bizpro.com',
        password: hashedPassword,
        role: 'artisan'
      }
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// Seed artisans
const seedArtisans = async () => {
  try {
    // Check if artisans already exist
    const artisansCount = await Artisan.countDocuments();
    if (artisansCount > 0) {
      console.log('Artisans already exist, skipping seed');
      return;
    }

    // Get categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('No categories found, skipping artisan seed');
      return;
    }

    // Get the artisan user
    const artisanUser = await User.findOne({ email: 'artisan@bizpro.com' });
    if (!artisanUser) {
      console.log('Artisan user not found, skipping artisan seed');
      return;
    }

    const artisans = [
      {
        user: artisanUser._id,
        businessName: 'Plumbing Experts',
        description: 'Professional plumbing services with over 10 years of experience.',
        location: 'New York',
        category: categories.find(c => c.name === 'Plumbing')._id,
        phone: '123-456-7890',
        featured: true,
        slug: 'plumbing-experts'
      },
      {
        user: artisanUser._id,
        businessName: 'Elite Electricians',
        description: 'Licensed and insured electrical contractors for all your electrical needs.',
        location: 'Chicago',
        category: categories.find(c => c.name === 'Electrical')._id,
        phone: '098-765-4321',
        featured: true,
        slug: 'elite-electricians'
      }
    ];

    await Artisan.insertMany(artisans);
    console.log('Artisans seeded successfully');
  } catch (err) {
    console.error('Error seeding artisans:', err);
  }
};

// Run all seed functions
const seedAll = async () => {
  await seedCategories();
  await seedUsers();
  await seedArtisans();
  console.log('All seed data inserted successfully');
};

module.exports = { seedAll }; 