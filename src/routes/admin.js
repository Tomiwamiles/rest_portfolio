const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Controllers
const {
  getDashboard,
  getArtisans,
  getCategories,
  getUsers,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleArtisanVerification,
  toggleArtisanFeatured,
  deleteArtisan,
  deleteUser
} = require('../controllers/adminController');

// Admin middleware to protect all routes
router.use(isAuth, isAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Artisan management
router.get('/artisans', getArtisans);
router.put('/artisans/:id/verify', toggleArtisanVerification);
router.put('/artisans/:id/feature', toggleArtisanFeatured);
router.delete('/artisans/:id', deleteArtisan);

// Category management
router.get('/categories', getCategories);
router.post('/categories', upload.single('icon'), createCategory);
router.put('/categories/:id', upload.single('icon'), updateCategory);
router.delete('/categories/:id', deleteCategory);

// User management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router; 