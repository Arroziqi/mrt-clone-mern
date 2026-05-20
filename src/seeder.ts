import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Station from './models/Station';
import connectDB from './config/db';

const stationsData = [
  { stationId: 'STN-LB', name: 'Lebak Bulus Grab', orderIndex: 1, basePriceRp: 3000 },
  { stationId: 'STN-FM', name: 'Fatmawati Indomaret', orderIndex: 2, basePriceRp: 3000 },
  { stationId: 'STN-CP', name: 'Cipete Raya', orderIndex: 3, basePriceRp: 3000 },
  { stationId: 'STN-HJ', name: 'Haji Nawi', orderIndex: 4, basePriceRp: 3000 },
  { stationId: 'STN-BA', name: 'Blok A', orderIndex: 5, basePriceRp: 3000 },
  { stationId: 'STN-BL', name: 'Blok M BCA', orderIndex: 6, basePriceRp: 3000 },
  { stationId: 'STN-AS', name: 'ASEAN', orderIndex: 7, basePriceRp: 3000 },
  { stationId: 'STN-SN', name: 'Senayan Mastercard', orderIndex: 8, basePriceRp: 3000 },
  { stationId: 'STN-IS', name: 'Istora Mandiri', orderIndex: 9, basePriceRp: 3000 },
  { stationId: 'STN-BN', name: 'Bendungan Hilir', orderIndex: 10, basePriceRp: 3000 },
  { stationId: 'STN-ST', name: 'Setiabudi Astra', orderIndex: 11, basePriceRp: 3000 },
  { stationId: 'STN-DK', name: 'Dukuh Atas BNI', orderIndex: 12, basePriceRp: 3000 },
  { stationId: 'STN-HI', name: 'Bundaran HI Bank Jakarta', orderIndex: 13, basePriceRp: 3000 },
  { stationId: 'STN-SR', name: 'Sarinah', orderIndex: 14, basePriceRp: 3000 },
  { stationId: 'STN-MN', name: 'Monas', orderIndex: 15, basePriceRp: 3000 },
  { stationId: 'STN-HM', name: 'Harmoni', orderIndex: 16, basePriceRp: 3000 },
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
