const Artisan = require('../models/Artisan');
const Category = require('../models/Category');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { users, artisans, categories } = require('../utils/mockData');

/**
 * @desc    Get admin dashboard
 * @route   GET /admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboard = async (req, res) => {
  try {
    // Get counts for dashboard stats
    const stats = {
      artisansCount: artisans.length,
      usersCount: users.length,
      categoriesCount: categories.length,
      pendingVerifications: artisans.filter(a => !a.isVerified).length
    };

    // Mock recent activity
    const recentActivity = [
      {
        title: 'New Artisan Registration',
        description: 'John Smith registered as a plumber',
        time: '2 hours ago'
      },
      {
        title: 'Category Added',
        description: 'New category "Home Maintenance" was added',
        time: '5 hours ago'
      },
      {
        title: 'User Verification',
        description: 'Sarah Johnson was verified as an electrician',
        time: '1 day ago'
      }
    ];

    res.render('pages/admin/dashboard', {
      title: 'Admin Dashboard',
      stats,
      recentActivity
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
};

/**
 * @desc    Get all artisans for admin
 * @route   GET /admin/artisans
 * @access  Private (Admin)
 */
exports.getArtisans = async (req, res) => {
  try {
    const artisans = await Artisan.find().populate('category');
    
    res.render('pages/admin/artisans', {
      title: 'Manage Artisans',
      artisans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving artisans');
    res.redirect('/admin/dashboard');
  }
};

/**
 * @desc    Get all categories for admin
 * @route   GET /admin/categories
 * @access  Private (Admin)
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    res.render('pages/admin/categories', {
      title: 'Manage Categories',
      categories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving categories');
    res.redirect('/admin/dashboard');
  }
};

/**
 * @desc    Get all users for admin
 * @route   GET /admin/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.render('pages/admin/users', {
      title: 'Manage Users',
      users
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving users');
    res.redirect('/admin/dashboard');
  }
};

/**
 * @desc    Create new category
 * @route   POST /admin/categories
 * @access  Private (Admin)
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      req.flash('error_msg', 'Please provide a category name');
      return res.redirect('/admin/categories');
    }
    
    // Create category object
    const categoryData = { name };
    
    // Add description if provided
    if (description) {
      categoryData.description = description;
    }
    
    // Add icon if uploaded
    if (req.file) {
      categoryData.icon = req.file.filename;
    }
    
    // Create category
    await Category.create(categoryData);
    
    req.flash('success_msg', 'Category created successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating category');
    res.redirect('/admin/categories');
  }
};

/**
 * @desc    Update category
 * @route   PUT /admin/categories/:id
 * @access  Private (Admin)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Find category
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/admin/categories');
    }
    
    // Validate input
    if (!name) {
      req.flash('error_msg', 'Please provide a category name');
      return res.redirect('/admin/categories');
    }
    
    // Update category
    category.name = name;
    category.description = description || '';
    
    // Handle icon upload
    if (req.file) {
      // Delete old icon if it exists and is not the default
      if (category.icon !== 'category-default.png') {
        const iconPath = path.join(__dirname, '../../public/uploads', category.icon);
        if (fs.existsSync(iconPath)) {
          fs.unlinkSync(iconPath);
        }
      }
      
      // Set new icon
      category.icon = req.file.filename;
    }
    
    // Save category
    await category.save();
    
    req.flash('success_msg', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating category');
    res.redirect('/admin/categories');
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /admin/categories/:id
 * @access  Private (Admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/admin/categories');
    }
    
    // Check if category has artisans
    const artisansCount = await Artisan.countDocuments({ category: category._id });
    
    if (artisansCount > 0) {
      req.flash('error_msg', `Cannot delete category with ${artisansCount} artisans. Please reassign them first.`);
      return res.redirect('/admin/categories');
    }
    
    // Delete icon if it's not the default
    if (category.icon !== 'category-default.png') {
      const iconPath = path.join(__dirname, '../../public/uploads', category.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }
    
    // Delete category
    await category.remove();
    
    req.flash('success_msg', 'Category deleted successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting category');
    res.redirect('/admin/categories');
  }
};

/**
 * @desc    Toggle artisan verification status
 * @route   PUT /admin/artisans/:id/verify
 * @access  Private (Admin)
 */
exports.toggleArtisanVerification = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/admin/artisans');
    }
    
    // Toggle verification status
    artisan.isVerified = !artisan.isVerified;
    await artisan.save();
    
    req.flash('success_msg', `Artisan ${artisan.isVerified ? 'verified' : 'unverified'} successfully`);
    res.redirect('/admin/artisans');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating artisan verification');
    res.redirect('/admin/artisans');
  }
};

/**
 * @desc    Toggle artisan featured status
 * @route   PUT /admin/artisans/:id/feature
 * @access  Private (Admin)
 */
exports.toggleArtisanFeatured = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/admin/artisans');
    }
    
    // Toggle featured status
    artisan.featured = !artisan.featured;
    await artisan.save();
    
    req.flash('success_msg', `Artisan ${artisan.featured ? 'featured' : 'unfeatured'} successfully`);
    res.redirect('/admin/artisans');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating artisan featured status');
    res.redirect('/admin/artisans');
  }
};

/**
 * @desc    Delete artisan (admin)
 * @route   DELETE /admin/artisans/:id
 * @access  Private (Admin)
 */
exports.deleteArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      req.flash('error_msg', 'Artisan not found');
      return res.redirect('/admin/artisans');
    }
    
    // Delete image if it's not the default
    if (artisan.profileImage && artisan.profileImage !== 'default.jpg') {
      const imagePath = path.join(__dirname, '../../public/uploads', artisan.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Update any user who has this artisan profile
    await User.findOneAndUpdate(
      { artisanProfile: artisan._id },
      { artisanProfile: null }
    );
    
    // Delete artisan
    await artisan.remove();
    
    req.flash('success_msg', 'Artisan deleted successfully');
    res.redirect('/admin/artisans');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting artisan');
    res.redirect('/admin/artisans');
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /admin/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Check if user is admin and prevent deletion
    if (user.role === 'admin') {
      req.flash('error_msg', 'Cannot delete admin user');
      return res.redirect('/admin/users');
    }
    
    // Check if user has an artisan profile
    if (user.artisanProfile) {
      const artisan = await Artisan.findById(user.artisanProfile);
      
      if (artisan) {
        // Delete artisan image if it's not the default
        if (artisan.profileImage && artisan.profileImage !== 'default.jpg') {
          const imagePath = path.join(__dirname, '../../public/uploads', artisan.profileImage);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        
        // Delete artisan
        await artisan.remove();
      }
    }
    
    // Delete user
    await user.remove();
    
    req.flash('success_msg', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting user');
    res.redirect('/admin/users');
  }
}; 