const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  icon: {
    type: String,
    default: 'category-default.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name before saving
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Cascade delete artisans when a category is deleted
CategorySchema.pre('remove', async function(next) {
  await this.model('Artisan').deleteMany({ category: this._id });
  next();
});

module.exports = mongoose.model('Category', CategorySchema); 