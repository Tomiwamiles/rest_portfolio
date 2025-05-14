const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');

// Controllers
const { 
  getHomePage, 
  getAboutPage, 
  getContactPage,
  submitContactForm,
  getLoginPage,
  getRegisterPage,
  loginUser,
  registerUser,
  logoutUser,
  getProfilePage,
  updateProfile,
  search
} = require('../controllers/indexController');

// Public routes
router.get('/', async (req, res) => {
  try {
    const categories = req.mockData.getCategories();
    const allArtisans = req.mockData.getArtisans();
    
    // Populate categories for each artisan
    const featuredArtisans = allArtisans
      .filter(artisan => artisan.featured)
      .map(artisan => ({
        ...artisan,
        category: categories.find(cat => cat._id === artisan.category)
      }));

    res.render('pages/index', {
      title: 'Home',
      categories,
      featuredArtisans
    });
  } catch (error) {
    console.error('Error in index route:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong' 
    });
  }
});

router.get('/about', getAboutPage);
router.get('/contact', getContactPage);
router.post('/contact', submitContactForm);
router.get('/search', search);
router.post('/search', search);

// Authentication routes
router.get('/login', getLoginPage);
router.post('/login', loginUser);
router.get('/register', getRegisterPage);
router.post('/register', registerUser);
router.get('/logout', logoutUser);

// Protected routes
router.get('/profile', isAuth, getProfilePage);
router.post('/profile', isAuth, updateProfile);

module.exports = router; 