/**
 * Authentication middleware for protecting routes
 */

// Check if user is authenticated
exports.isAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  // Check if the user is trying to access the artisan registration page
  if (req.originalUrl === '/artisans/register') {
    req.flash('error_msg', 'You need to login or create an account before registering as an artisan');
  } else {
    req.flash('error_msg', 'Please log in to access this resource');
  }
  
  return res.redirect('/login');
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Please log in to access this resource');
    return res.redirect('/login');
  }
  
  if (req.session.user.role !== 'admin') {
    req.flash('error_msg', 'You are not authorized to access this resource');
    return res.redirect('/');
  }
  
  next();
};

// Authorize roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to access this resource');
      return res.redirect('/login');
    }
    
    if (!roles.includes(req.session.user.role)) {
      req.flash('error_msg', 'You are not authorized to access this resource');
      return res.redirect('/');
    }
    
    next();
  };
};

// Check if user owns the artisan profile
exports.isArtisanOwner = async (req, res, next) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to access this resource');
      return res.redirect('/login');
    }
    
    // Admin can access all artisan profiles
    if (req.session.user.role === 'admin') {
      return next();
    }
    
    // Check if user has an artisan profile and if it matches the requested one
    if (!req.session.user.artisanProfile || 
        req.session.user.artisanProfile.toString() !== req.params.id) {
      req.flash('error_msg', 'You are not authorized to perform this action');
      return res.redirect('/');
    }
    
    next();
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Authorization error');
    res.redirect('/');
  }
}; 