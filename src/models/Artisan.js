const mongoose = require('mongoose');
const slugify = require('slugify');

const ArtisanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [false, 'Name is required']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  address: {
    type: String,
    required: [false, 'Address is required']
  },
  city: {
    type: String,
    required: [false, 'City is required']
  },
  state: {
    type: String
  },
  country: {
    type: String,
    required: [false, 'Country is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9\-\+\s\(\)]{7,20}$/, 'Please provide a valid phone number']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  services: {
    type: [String]
  },
  ratings: {
    average: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  profileImage: {
    type: String
  },
  galleryImages: [String],
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from business name
ArtisanSchema.pre('save', function(next) {
  if (this.isModified('businessName')) {
    this.slug = slugify(this.businessName, { lower: true });
  }
  next();
});

// Cascade delete services when an artisan is deleted
ArtisanSchema.pre('remove', async function(next) {
  await this.model('Service').deleteMany({ artisan: this._id });
  next();
});

module.exports = mongoose.model('Artisan', ArtisanSchema); 