const mongoose = require('mongoose');
const Neighborhood = require('./models/Neighborhood');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neighborfit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Read neighborhood data from JSON file
const neighborhoodsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/neighborhoods.json'), 'utf8')
);

// Seed function
const seedNeighborhoods = async () => {
  try {
    // Clear existing neighborhoods
    await Neighborhood.deleteMany({});
    console.log('Cleared existing neighborhoods');

    // Insert new neighborhoods
    const neighborhoods = await Neighborhood.insertMany(neighborhoodsData);
    console.log(`Successfully seeded ${neighborhoods.length} neighborhoods`);

    // Log some sample data
    console.log('\nSample neighborhoods:');
    neighborhoods.slice(0, 3).forEach(neighborhood => {
      console.log(`- ${neighborhood.name}, ${neighborhood.city}, ${neighborhood.state}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedNeighborhoods(); 