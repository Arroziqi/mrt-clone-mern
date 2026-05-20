import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Station from './models/Station';
import connectDB from './config/db';

const stationsData = [
  { stationId: 'STN-HI', name: 'Bundaran HI', orderIndex: 1 },
  { stationId: 'STN-DK', name: 'Dukuh Atas BNI', orderIndex: 2 },
  { stationId: 'STN-ST', name: 'Setiabudi Astra', orderIndex: 3 },
  { stationId: 'STN-BN', name: 'Bendungan Hilir', orderIndex: 4 },
  { stationId: 'STN-IS', name: 'Istora Mandiri', orderIndex: 5 },
  { stationId: 'STN-SN', name: 'Senayan', orderIndex: 6 },
  { stationId: 'STN-AS', name: 'ASEAN', orderIndex: 7 },
  { stationId: 'STN-BL', name: 'Blok M BCA', orderIndex: 8 },
  { stationId: 'STN-BA', name: 'Blok A', orderIndex: 9 },
  { stationId: 'STN-HJ', name: 'Haji Nawi', orderIndex: 10 },
  { stationId: 'STN-CP', name: 'Cipete Raya', orderIndex: 11 },
  { stationId: 'STN-FM', name: 'Fatmawati Indomaret', orderIndex: 12 },
  { stationId: 'STN-LB', name: 'Lebak Bulus Grab', orderIndex: 13 },
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Station.deleteMany();
    
    // Insert new data
    await Station.insertMany(stationsData);
    
    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

seedData();
