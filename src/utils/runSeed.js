const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedAll } = require('./seedData');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bizpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  // Run the seed function
  await seedAll();
  
  // Close the connection
  mongoose.connection.close();
  console.log('MongoDB connection closed');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 