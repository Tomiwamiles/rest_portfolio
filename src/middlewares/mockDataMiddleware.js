const mockData = require('../utils/mockData');

// Middleware to provide mock data for controllers
const useMockData = (req, res, next) => {
  // Add mock data functions to request object
  req.mockData = {
    getCategories: () => mockData.categories,
    getArtisans: () => mockData.artisans,
    getFeaturedArtisans: () => mockData.artisans.filter(a => a.featured),
    getUsers: () => mockData.users,
    findById: mockData.findById,
    find: mockData.find,
    populate: mockData.populate
  };
  
  next();
};

module.exports = useMockData; 