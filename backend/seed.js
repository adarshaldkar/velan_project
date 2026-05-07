const mongoose = require('mongoose');
require('dotenv').config();
const Fault = require('./models/Fault');

const sampleData = [
  { distance: 0, temperature: 32.5, status: 'NORMAL', phase: 'NONE' },
  { distance: 120, temperature: 34.2, status: 'FAULT', phase: 'R' },
  { distance: 0, temperature: 41.8, status: 'WARNING', phase: 'ALL' },
  { distance: 250, temperature: 33.1, status: 'FAULT', phase: 'Y' },
  { distance: 0, temperature: 31.9, status: 'NORMAL', phase: 'NONE' },
  { distance: 400, temperature: 35.5, status: 'FAULT', phase: 'B' },
  { distance: 0, temperature: 45.2, status: 'WARNING', phase: 'ALL' },
  { distance: 150, temperature: 36.0, status: 'FAULT', phase: 'R' },
  { distance: 200, temperature: 37.0, status: 'FAULT', phase: 'Y' },
  { distance: 300, temperature: 38.0, status: 'FAULT', phase: 'B' },
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing data...');
    await Fault.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Inserting sample data...');
    await Fault.insertMany(sampleData);
    console.log('Sample data inserted successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDB();
