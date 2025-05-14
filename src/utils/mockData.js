// Mock data for BizPro application when MongoDB is unavailable

// Mock Categories
const categories = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Plumbing',
    description: 'Find reliable plumbers for all your plumbing needs, from repairs to installations.',
    icon: 'fas fa-wrench',
    slug: 'plumbing'
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Electrical',
    description: 'Licensed electricians for residential and commercial electrical services.',
    icon: 'fas fa-bolt',
    slug: 'electrical'
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Carpentry',
    description: 'Skilled carpenters for furniture, home repairs, and woodworking projects.',
    icon: 'fas fa-hammer',
    slug: 'carpentry'
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    name: 'Painting',
    description: 'Professional painters for interior and exterior painting services.',
    icon: 'fas fa-paint-roller',
    slug: 'painting'
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    name: 'Cleaning',
    description: 'Cleaning services for homes and businesses, from deep cleaning to regular maintenance.',
    icon: 'fas fa-broom',
    slug: 'cleaning'
  }
];

// Mock Users
const users = [
  {
    _id: '60d21b4667d0d8992e610c90',
    name: 'Admin User',
    email: 'admin@bizpro.com',
    password: '$2a$10$X/pYeE6GjE1g3d.yP9SYrO3RJJGk7JhGsNgxKS4YTzGDlD8yLEPxW', // password123
    role: 'admin'
  },
  {
    _id: '60d21b4667d0d8992e610c91',
    name: 'Customer User',
    email: 'customer@bizpro.com',
    password: '$2a$10$X/pYeE6GjE1g3d.yP9SYrO3RJJGk7JhGsNgxKS4YTzGDlD8yLEPxW', // password123
    role: 'customer'
  },
  {
    _id: '60d21b4667d0d8992e610c92',
    name: 'Artisan User',
    email: 'artisan@bizpro.com',
    password: '$2a$10$X/pYeE6GjE1g3d.yP9SYrO3RJJGk7JhGsNgxKS4YTzGDlD8yLEPxW', // password123
    role: 'artisan'
  }
];

// Mock Artisans
const artisans = [
  {
    _id: '60d21b4667d0d8992e610c95',
    user: '60d21b4667d0d8992e610c92',
    name: 'John Smith',
    businessName: 'Plumbing Experts',
    description: 'Professional plumbing services with over 10 years of experience.',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    category: '60d21b4667d0d8992e610c85', // Plumbing
    phone: '123-456-7890',
    featured: true,
    isVerified: true,
    profileImage: 'plumbing-1.jpg',
    slug: 'plumbing-experts'
  },
  {
    _id: '60d21b4667d0d8992e610c96',
    user: '60d21b4667d0d8992e610c92',
    name: 'Sarah Johnson',
    businessName: 'Elite Electricians',
    description: 'Licensed and insured electrical contractors for all your electrical needs.',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    category: '60d21b4667d0d8992e610c86', // Electrical
    phone: '098-765-4321',
    featured: true,
    isVerified: true,
    profileImage: 'electrical-1.jpg',
    slug: 'elite-electricians'
  },
  {
    _id: '60d21b4667d0d8992e610c97',
    user: '60d21b4667d0d8992e610c92',
    name: 'Mike Wilson',
    businessName: 'Master Carpentry',
    description: 'Custom woodworking and furniture repair services.',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    category: '60d21b4667d0d8992e610c87', // Carpentry
    phone: '555-123-4567',
    featured: true,
    isVerified: true,
    profileImage: 'carpentry-1.jpg',
    slug: 'master-carpentry',
    services: ['Custom Furniture', 'Wood Repair', 'Cabinet Making']
  },
  {
    _id: '60d21b4667d0d8992e610c98',
    user: '60d21b4667d0d8992e610c92',
    name: 'Lisa Brown',
    businessName: 'Perfect Painters',
    description: 'Professional interior and exterior painting services.',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    category: '60d21b4667d0d8992e610c88', // Painting
    phone: '777-888-9999',
    featured: true,
    isVerified: true,
    profileImage: 'painting-1.jpg',
    slug: 'perfect-painters',
    services: ['Interior Painting', 'Exterior Painting', 'Wall Repair']
  },
  {
    _id: '60d21b4667d0d8992e610c99',
    user: '60d21b4667d0d8992e610c92',
    name: 'David Chen',
    businessName: 'Spotless Cleaning Services',
    description: 'Professional cleaning services for homes and offices.',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    category: '60d21b4667d0d8992e610c89', // Cleaning
    phone: '111-222-3333',
    featured: true,
    isVerified: true,
    profileImage: 'cleaning-1.jpg',
    slug: 'spotless-cleaning'
  }
];

// Find functions that mimic MongoDB queries
const findById = (collection, id) => {
  return collection.find(item => item._id === id);
};

const find = (collection, query = {}) => {
  if (Object.keys(query).length === 0) {
    return [...collection];
  }
  
  return collection.filter(item => {
    // Handle $or operator
    if (query.$or) {
      return query.$or.some(orCondition => {
        return Object.entries(orCondition).every(([key, value]) => {
          if (value instanceof RegExp) {
            return value.test(item[key]);
          }
          return item[key] === value;
        });
      });
    }

    // Handle $and operator
    if (query.$and) {
      return query.$and.every(andCondition => {
        if (andCondition.$or) {
          return andCondition.$or.some(orCondition => {
            return Object.entries(orCondition).every(([key, value]) => {
              if (value instanceof RegExp) {
                return value.test(item[key]);
              }
              return item[key] === value;
            });
          });
        }
        return Object.entries(andCondition).every(([key, value]) => {
          if (value instanceof RegExp) {
            return value.test(item[key]);
          }
          return item[key] === value;
        });
      });
    }

    // Handle regular queries
    return Object.entries(query).every(([key, value]) => {
      if (value instanceof RegExp) {
        return value.test(item[key]);
      }
      return item[key] === value;
    });
  });
};

// Populate function that mimics MongoDB populate
const populate = (items, field, targetCollection) => {
  return items.map(item => {
    if (item[field]) {
      const populated = findById(targetCollection, item[field]);
      if (populated) {
        return {
          ...item,
          [field]: populated
        };
      }
    }
    return item;
  });
};

// Remove the duplicate artisans section and just export what we need
module.exports = {
  categories,
  users,
  artisans,
  findById,
  find,
  populate
}; 