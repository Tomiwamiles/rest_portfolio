const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');

/**
 * @desc    Render home page with featured artisans and categories
 * @route   GET /
 * @access  Public
 */
exports.getHomePage = async (req, res) => {
  try {
    let featuredArtisans;
    let categories;
    
    // Use either MongoDB or mock data
    if (global.useMongoDb === true) {
      try {
        // Get featured artisans from MongoDB
        featuredArtisans = await Artisan.find({ featured: true })
          .populate('category')
          .limit(6);
        
        // Get categories from MongoDB
        categories = await Category.find().limit(8);
      } catch (dbErr) {
        console.error('Error retrieving data from MongoDB:', dbErr);
        // Fall back to mock data
        featuredArtisans = req.mockData.getFeaturedArtisans();
        categories = req.mockData.getCategories();
      }
    } else {
      // Use mock data
      featuredArtisans = req.mockData.getFeaturedArtisans();
      categories = req.mockData.getCategories();
    }
    
    res.render('pages/index', {
      title: 'BizPro - Connect with Local Artisans',
      featuredArtisans,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/500', {
      title: 'Server Error',
      error: process.env.NODE_ENV === 'production' ? {} : err
    });
  }
};

/**
 * @desc    Render about page
 * @route   GET /about
 * @access  Public
 */
exports.getAboutPage = (req, res) => {
  res.render('pages/about', {
    title: 'About Us | BizPro'
  });
};

/**
 * @desc    Render contact page
 * @route   GET /contact
 * @access  Public
 */
exports.getContactPage = (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us | BizPro'
  });
};

/**
 * @desc    Render login page
 * @route   GET /login
 * @access  Public
 */
exports.getLoginPage = (req, res) => {
  // Redirect if already logged in
  if (req.session.user) {
    return res.redirect('/profile');
  }
  
  res.render('pages/login', {
    title: 'Login'
  });
};

/**
 * @desc    Login user
 * @route   POST /login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      req.flash('error_msg', 'Please provide email and password');
      return res.redirect('/login');
    }
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }
    
    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      artisanProfile: user.artisanProfile
    };
    
    req.flash('success_msg', 'You are now logged in');
    
    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Login failed');
    res.redirect('/login');
  }
};

/**
 * @desc    Render register page
 * @route   GET /register
 * @access  Public
 */
exports.getRegisterPage = (req, res) => {
  // Redirect if already logged in
  if (req.session.user) {
    return res.redirect('/profile');
  }
  
  res.render('pages/register', {
    title: 'Register'
  });
};

/**
 * @desc    Register user
 * @route   POST /register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validate input
    const errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('pages/register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('pages/register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Registration failed');
    res.redirect('/register');
  }
};

/**
 * @desc    Logout user
 * @route   GET /logout
 * @access  Private
 */
exports.logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

/**
 * @desc    Render profile page
 * @route   GET /profile
 * @access  Private
 */
exports.getProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    let artisanProfile = null;
    if (user.artisanProfile) {
      artisanProfile = await Artisan.findById(user.artisanProfile).populate('category');
    }
    
    res.render('pages/profile', {
      title: 'Your Profile',
      user,
      artisanProfile
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving profile');
    res.redirect('/');
  }
};

/**
 * @desc    Update user profile
 * @route   POST /profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate input
    if (!name || !email) {
      req.flash('error_msg', 'Please provide name and email');
      return res.redirect('/profile');
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      { name, email },
      { new: true, runValidators: true }
    );
    
    // Update session
    req.session.user.name = updatedUser.name;
    req.session.user.email = updatedUser.email;
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/profile');
  }
};

/**
 * @desc    Search artisans
 * @route   GET & POST /search
 * @access  Public
 */
exports.search = async (req, res) => {
  try {
    console.log('Search parameters:', {
      method: req.method,
      query: req.query,
      body: req.body
    });

    // Get search parameters from either query (GET) or body (POST)
    const category = req.method === 'GET' ? req.query.category : req.body.category;
    const location = req.method === 'GET' ? req.query.location : req.body.location;

    console.log('Processed search parameters:', { category, location });

    // Build search query
    const query = {};

    if (category && category.trim() !== '') {
      query.category = category.trim();
    }

    if (location && location.trim()) {
      const locationRegex = location.trim();
      query.$or = [
        { city: { $regex: locationRegex, $options: 'i' } },
        { state: { $regex: locationRegex, $options: 'i' } },
        { country: { $regex: locationRegex, $options: 'i' } }
      ];
    }

    console.log('Search query:', JSON.stringify(query, null, 2));

    // Execute search
    let artisans;
    let categories;

    if (global.useMongoDb) {
      try {
        // Get artisans from MongoDB with populated category
        artisans = await Artisan.find(query)
          .populate('category')
          .sort({ 'ratings.average': -1 });

        console.log(`Found ${artisans.length} artisans from MongoDB`);

        // Get all categories for the search form
        categories = await Category.find();
      } catch (dbErr) {
        console.error('Error searching in MongoDB:', dbErr);
        // Fall back to mock data
        artisans = req.mockData.getArtisans();
        categories = req.mockData.getCategories();

        // Filter mock data
        if (category || location) {
          artisans = artisans.filter(artisan => {
            let matches = true;

            if (category && category.trim() !== '') {
              matches = matches && artisan.category._id.toString() === category.trim();
            }

            if (location && location.trim()) {
              const locationRegex = new RegExp(location.trim(), 'i');
              matches = matches && (
                locationRegex.test(artisan.city) ||
                locationRegex.test(artisan.state) ||
                locationRegex.test(artisan.country)
              );
            }

            return matches;
          });
        }
      }
    } else {
      // Use mock data
      artisans = req.mockData.getArtisans();
      categories = req.mockData.getCategories();

      // Filter mock data
      if (category || location) {
        artisans = artisans.filter(artisan => {
          let matches = true;

          if (category && category.trim() !== '') {
            matches = matches && artisan.category._id.toString() === category.trim();
          }

          if (location && location.trim()) {
            const locationRegex = new RegExp(location.trim(), 'i');
            matches = matches && (
              locationRegex.test(artisan.city) ||
              locationRegex.test(artisan.state) ||
              locationRegex.test(artisan.country)
            );
          }

          return matches;
        });
      }

      // Populate categories for mock data
      artisans = req.mockData.populate(artisans, 'category', categories);
    }

    // Sort artisans by rating
    artisans.sort((a, b) => {
      const ratingA = a.ratings?.average || 0;
      const ratingB = b.ratings?.average || 0;
      return ratingB - ratingA;
    });

    // Render search results
    res.render('pages/search-results', {
      title: 'Search Results',
      artisans,
      categories,
      selectedCategory: category || '',
      selectedLocation: location || ''
    });
  } catch (err) {
    console.error('Search error:', err);
    req.flash('error_msg', 'Error performing search');
    res.redirect('/');
  }
};

/**
 * @desc    Handle contact form submission
 * @route   POST /contact
 * @access  Public
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/contact');
    }
    
    // In a real application, this would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Setup auto-reply
    
    // For now, just show success message
    req.flash('success_msg', 'Thank you for your message. We will get back to you soon!');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error sending message');
    res.redirect('/contact');
  }
}; 