const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const useMockData = require('./middlewares/mockDataMiddleware');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Set up uploads directory
require('./utils/setupUploads');

// MongoDB connection attempt
console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/bizpro');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 5000 // Longer timeout to give more time to connect
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  global.useMongoDb = true;
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Using mock data instead of MongoDB');
  global.useMongoDb = false;
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session setup with in-memory store for simplicity
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
};

app.use(session(sessionConfig));

// Mock data middleware
app.use(useMockData);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || [];
  res.locals.error_msg = req.flash('error_msg') || [];
  res.locals.error = req.flash('error') || [];
  res.locals.user = req.session.user || null;
  next();
});

// Static files - move this before routes
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
const imagesDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Set up default image
const defaultImagePath = path.join(__dirname, '../public/images/default.jpg');
if (!fs.existsSync(defaultImagePath)) {
  const defaultImageSource = path.join(__dirname, '../public/uploads/plumbing-1.jpg');
  if (fs.existsSync(defaultImageSource)) {
    fs.copyFileSync(defaultImageSource, defaultImagePath);
  }
}

// View engine setup
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout', 'layouts/main');

// Add locals middleware for layout blocks
app.use((req, res, next) => {
  res.locals.blocks = {};
  res.locals.title = 'BizPro';
  next();
});

// Routes
const indexRoutes = require('./routes/index');
const artisanRoutes = require('./routes/artisans');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/artisans', artisanRoutes);
app.use('/customers', customerRoutes);
app.use('/admin', adminRoutes);

// 404 route
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', { 
    title: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 