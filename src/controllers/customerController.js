const Artisan = require('../models/Artisan');
const Category = require('../models/Category');
const User = require('../models/User');

/**
 * @desc    Render customer dashboard
 * @route   GET /customers/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res) => {
  try {
    let featuredArtisans;
    
    if (global.useMongoDb === true) {
      try {
        featuredArtisans = await Artisan.find({ featured: true })
          .populate('category')
          .limit(6);
      } catch (dbErr) {
        console.error('Error retrieving data from MongoDB:', dbErr);
        featuredArtisans = req.mockData.getFeaturedArtisans();
      }
    } else {
      featuredArtisans = req.mockData.getFeaturedArtisans();
    }
    
    res.render('pages/customer/dashboard', {
      title: 'Customer Dashboard',
      featuredArtisans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving dashboard');
    res.redirect('/');
  }
};

/**
 * @desc    Get all categories
 * @route   GET /customers/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    console.log('Fetching categories...');
    let categories;
    
    if (global.useMongoDb === true) {
      try {
        console.log('Using MongoDB for categories');
        categories = await Category.find();
        console.log(`Found ${categories.length} categories from MongoDB`);
        
        if (categories.length > 0) {
          console.log('Sample category:', {
            id: categories[0]._id,
            name: categories[0].name,
            slug: categories[0].slug
          });
        }
      } catch (dbErr) {
        console.error('Error retrieving data from MongoDB:', dbErr);
        console.log('Falling back to mock data for categories');
        categories = req.mockData.getCategories();
        console.log(`Found ${categories.length} categories from mock data`);
      }
    } else {
      console.log('Using mock data for categories');
      categories = req.mockData.getCategories();
      console.log(`Found ${categories.length} categories from mock data`);
    }
    
    res.render('pages/customer/categories', {
      title: 'Browse Categories',
      categories
    });
  } catch (err) {
    console.error('Error in getCategories:', err);
    req.flash('error_msg', 'Error retrieving categories');
    res.redirect('/');
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /customers/categories/:id
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/customers/categories');
    }
    
    // Get artisans in this category
    const artisans = await Artisan.find({ category: category._id });
    
    res.render('pages/customer/category', {
      title: category.name,
      category,
      artisans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving category');
    res.redirect('/customers/categories');
  }
};

/**
 * @desc    Get artisans by category
 * @route   GET /customers/browse/category/:categoryId
 * @access  Public
 */
exports.getArtisansByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/customers/categories');
    }
    
    const artisans = await Artisan.find({ category: category._id })
      .populate('category');
    
    res.render('pages/customer/artisans-by-category', {
      title: `${category.name} Artisans`,
      category,
      artisans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving artisans');
    res.redirect('/customers/categories');
  }
};

/**
 * @desc    Get artisans by location
 * @route   GET /customers/browse/location/:location
 * @access  Public
 */
exports.getArtisansByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    
    const artisans = await Artisan.find({
      $or: [
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } }
      ]
    }).populate('category');
    
    res.render('pages/customer/artisans-by-location', {
      title: `Artisans in ${location}`,
      location,
      artisans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving artisans');
    res.redirect('/');
  }
};

/**
 * @desc    Send contact message to artisan
 * @route   POST /customers/contact/:artisanId
 * @access  Private
 */
exports.contactArtisan = async (req, res) => {
  try {
    const { message } = req.body;
    const artisanId = req.params.artisanId;
    
    if (!message) {
      req.flash('error_msg', 'Please provide a message');
      return res.redirect(`/artisans/${artisanId}`);
    }
    
    const artisan = await Artisan.findById(artisanId);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/artisans');
    }
    
    // In a real application, this would send an email or create a message in a messages collection
    // For now, we'll just show a success message
    
    req.flash('success_msg', `Message sent to ${artisan.businessName || artisan.name}`);
    res.redirect(`/artisans/${artisanId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error sending message');
    res.redirect(`/artisans/${req.params.artisanId}`);
  }
}; 