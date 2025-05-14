const express = require('express');
const router = express.Router();
const { isAuth, isArtisanOwner } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Controllers
const {
  getArtisans,
  getArtisanBySlug,
  getArtisanById,
  createArtisan,
  updateArtisan,
  deleteArtisan,
  getRegisterArtisanForm
} = require('../controllers/artisanController');

// Get all artisans (with optional filters)
router.get('/', getArtisans);

// Create new artisan (protected, requires authentication)
router.get('/register', isAuth, getRegisterArtisanForm);
router.post('/', isAuth, upload.single('image'), createArtisan);

// Get artisan by slug (public view)
router.get('/slug/:slug', getArtisanBySlug);

// Get, update and delete artisan by ID (protected, requires ownership)
router.get('/:id', getArtisanById);
router.put('/:id', isAuth, isArtisanOwner, upload.single('image'), updateArtisan);
router.delete('/:id', isAuth, isArtisanOwner, deleteArtisan);

module.exports = router; 