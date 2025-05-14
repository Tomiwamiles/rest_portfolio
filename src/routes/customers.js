const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');

// Controllers
const {
  getDashboard,
  getCategories,
  getCategoryById,
  getArtisansByCategory,
  getArtisansByLocation,
  contactArtisan
} = require('../controllers/customerController');

// Customer dashboard (protected)
router.get('/dashboard', isAuth, getDashboard);

// Browse categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Browse artisans by category or location
router.get('/browse/category/:categoryId', getArtisansByCategory);
router.get('/browse/location/:location', getArtisansByLocation);

// Contact artisan (protected)
router.post('/contact/:artisanId', isAuth, contactArtisan);

module.exports = router; 