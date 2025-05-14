const Artisan = require('../models/Artisan');
const Category = require('../models/Category');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get all artisans with optional filtering
 * @route   GET /artisans
 * @access  Public
 */
exports.getArtisans = async (req, res) => {
  try {
    console.log('Fetching artisans...');
    
    // Build query with filter options
    const { category, location, featured, verified } = req.query;
    const queryObj = {};
    
    if (category) {
      queryObj.category = category;
    }
    
    if (location) {
      queryObj.$or = [
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } }
      ];
    }
    
    if (featured === 'true') {
      queryObj.featured = true;
    }
    
    if (verified === 'true') {
      queryObj.isVerified = true;
    }
    
    console.log('Query object:', queryObj);
    
    // Execute query
    const artisans = await Artisan.find(queryObj).populate('category');
    const categories = await Category.find();
    
    console.log(`Found ${artisans.length} artisans`);
    console.log(`Found ${categories.length} categories`);
    
    if (artisans.length > 0) {
      console.log('Sample artisan:', {
        id: artisans[0]._id,
        businessName: artisans[0].businessName,
        slug: artisans[0].slug,
        category: artisans[0].category
      });
    }
    
    res.render('pages/artisans/index', {
      title: 'Browse Artisans',
      artisans,
      categories,
      filters: { category, location, featured, verified }
    });
  } catch (err) {
    console.error('Error in getArtisans:', err);
    req.flash('error_msg', 'Error retrieving artisans');
    res.redirect('/');
  }
};

/**
 * @desc    Get artisan by slug
 * @route   GET /artisans/slug/:slug
 * @access  Public
 */
exports.getArtisanBySlug = async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ slug: req.params.slug }).populate('category');
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/artisans');
    }
    
    res.render('pages/artisans/show', {
      title: artisan.name,
      artisan
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving artisan');
    res.redirect('/artisans');
  }
};

/**
 * @desc    Get artisan by ID
 * @route   GET /artisans/:id
 * @access  Public
 */
exports.getArtisanById = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id).populate('category');
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/artisans');
    }
    
    res.render('pages/artisans/show', {
      title: artisan.name,
      artisan
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving artisan');
    res.redirect('/artisans');
  }
};

/**
 * @desc    Render form to register as artisan
 * @route   GET /artisans/register
 * @access  Private
 */
exports.getRegisterArtisanForm = async (req, res) => {
  try {
    // Ensure user is logged in - should never reach this point without auth middleware
    if (!req.session || !req.session.user || !req.session.user.id) {
      req.flash('error_msg', 'You must be logged in to register as an artisan');
      return res.redirect('/login');
    }
    
    // Check if user already has an artisan profile
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/login');
    }
    
    if (user.artisanProfile) {
      req.flash('error_msg', 'You already have an artisan profile');
      return res.redirect(`/artisans/${user.artisanProfile}`);
    }
    
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories for artisan registration form`);
    
    res.render('pages/artisans/register', {
      title: 'Register as Artisan',
      categories
    });
  } catch (err) {
    console.error('Error in getRegisterArtisanForm:', err);
    req.flash('error_msg', 'Error retrieving registration form');
    res.redirect('/profile');
  }
};

/**
 * @desc    Create new artisan
 * @route   POST /artisans
 * @access  Private
 */
exports.createArtisan = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      address,
      city,
      state,
      country,
      category
    } = req.body;
    
    // Validate input
    if (!name || !description || !phone || !address || !city || !country || !category) {
      req.flash('error_msg', 'Please fill in all required fields');
      return res.redirect('/artisans/register');
    }
    
    // Check if user already has an artisan profile
    const user = await User.findById(req.session.user.id);
    
    if (user.artisanProfile) {
      req.flash('error_msg', 'You already have an artisan profile');
      return res.redirect(`/artisans/${user.artisanProfile}`);
    }
    
    // Create artisan object
    const artisanData = {
      name,
      description,
      phone,
      address,
      city,
      state,
      country,
      category
    };
    
    // Add email if provided
    if (email) {
      artisanData.email = email;
    }
    
    // Handle image upload
    if (req.file) {
      artisanData.profileImage = req.file.filename;
    }
    
    // Create artisan
    const artisan = await Artisan.create(artisanData);
    
    // Update user with artisan profile reference
    await User.findByIdAndUpdate(
      req.session.user.id,
      { artisanProfile: artisan._id },
      { new: true }
    );
    
    // Update session
    req.session.user.artisanProfile = artisan._id;
    
    req.flash('success_msg', 'Artisan profile created successfully');
    res.redirect(`/artisans/${artisan._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating artisan profile');
    res.redirect('/artisans/register');
  }
};

/**
 * @desc    Update artisan
 * @route   PUT /artisans/:id
 * @access  Private (Owner or Admin)
 */
exports.updateArtisan = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      address,
      city,
      state,
      country,
      category
    } = req.body;
    
    // Find artisan
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/profile');
    }
    
    // Validate input
    if (!name || !description || !phone || !address || !city || !country || !category) {
      req.flash('error_msg', 'Please fill in all required fields');
      return res.redirect(`/artisans/${artisan._id}/edit`);
    }
    
    // Update artisan object
    artisan.name = name;
    artisan.description = description;
    artisan.phone = phone;
    artisan.email = email || '';
    artisan.address = address;
    artisan.city = city;
    artisan.state = state;
    artisan.country = country;
    artisan.category = category;
    
    // Handle image upload
    if (req.file) {
      // Delete old image if it exists and is not the default
      if (artisan.profileImage && artisan.profileImage !== 'default.jpg') {
        const imagePath = path.join(__dirname, '../../public/uploads', artisan.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Set new image
      artisan.profileImage = req.file.filename;
    }
    
    // Save artisan
    await artisan.save();
    
    req.flash('success_msg', 'Artisan profile updated successfully');
    res.redirect(`/artisans/${artisan._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating artisan profile');
    res.redirect(`/artisans/${req.params.id}/edit`);
  }
};

/**
 * @desc    Delete artisan
 * @route   DELETE /artisans/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/profile');
    }
    
    // Delete image if it's not the default
    if (artisan.profileImage && artisan.profileImage !== 'default.jpg') {
      const imagePath = path.join(__dirname, '../../public/uploads', artisan.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // If user is not admin, update user's artisanProfile to null
    if (req.session.user.role !== 'admin') {
      await User.findByIdAndUpdate(
        req.session.user.id,
        { artisanProfile: null },
        { new: true }
      );
      
      // Update session
      req.session.user.artisanProfile = null;
    } else {
      // If admin, find user with this artisan profile and update it
      await User.findOneAndUpdate(
        { artisanProfile: artisan._id },
        { artisanProfile: null },
        { new: true }
      );
    }
    
    // Delete artisan
    await artisan.remove();
    
    req.flash('success_msg', 'Artisan profile deleted successfully');
    
    // Redirect based on role
    if (req.session.user.role === 'admin') {
      res.redirect('/admin/artisans');
    } else {
      res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting artisan profile');
    res.redirect('/profile');
  }
}; 