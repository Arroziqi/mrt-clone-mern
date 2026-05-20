import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Station from './models/Station';
import Schedule from './models/Schedule';
import connectDB from './config/db';
import logger from './utils/logger';

// ── Station seed data ────────────────────────────────────────────────
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

// ── Schedule generation helpers ──────────────────────────────────────

interface TimeBlock {
  startHour: number;
  endHour: number;
  intervalMin: number;
}

const weekdayBlocks: TimeBlock[] = [
  { startHour: 5,  endHour: 6,  intervalMin: 10 },
  { startHour: 6,  endHour: 9,  intervalMin: 5  },
  { startHour: 9,  endHour: 16, intervalMin: 10 },
  { startHour: 16, endHour: 19, intervalMin: 5  },
  { startHour: 19, endHour: 22, intervalMin: 10 },
  { startHour: 22, endHour: 24, intervalMin: 15 },
];

const weekendBlocks: TimeBlock[] = [
  { startHour: 5,  endHour: 6,  intervalMin: 12 },
  { startHour: 6,  endHour: 9,  intervalMin: 10 },
  { startHour: 9,  endHour: 16, intervalMin: 10 },
  { startHour: 16, endHour: 19, intervalMin: 10 },
  { startHour: 19, endHour: 22, intervalMin: 12 },
  { startHour: 22, endHour: 24, intervalMin: 15 },
];

/**
 * Generate a full day's departure times for a terminus station (offset = 0).
 * Returns an array of "HH:mm" strings.
 */
function generateBaseDepartures(blocks: TimeBlock[]): string[] {
  const times: string[] = [];
  for (const block of blocks) {
    let minute = block.startHour * 60;
    const endMinute = block.endHour * 60;
    while (minute < endMinute) {
      const h = Math.floor(minute / 60);
      const m = minute % 60;
      // Skip times at or past midnight
      if (h < 24) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
      minute += block.intervalMin;
    }
  }
  return times;
}

/**
 * Offset every departure time by a given number of minutes.
 * This simulates a train departing from the terminus and arriving
 * at downstream stations after `offsetMin` minutes of travel.
 */
function offsetDepartures(baseTimes: string[], offsetMin: number): string[] {
  return baseTimes
    .map((t) => {
      const [h, m] = t.split(':').map(Number);
      const total = h * 60 + m + offsetMin;
      const newH = Math.floor(total / 60);
      const newM = total % 60;
      // Drop any times that overflow past 23:59
      if (newH >= 24) return null;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    })
    .filter((t): t is string => t !== null);
}

/**
 * Build schedule documents for every station, both directions, both day types.
 *
 * Travel time per station hop: 2 minutes.
 *
 * Northbound (toward Harmoni, orderIndex 16):
 *   - Train departs Lebak Bulus (orderIndex 1) at base time.
 *   - Each subsequent station gets +2 min per hop from Lebak Bulus.
 *   - Harmoni (orderIndex 16) has no northbound schedule (it's the terminus).
 *
 * Southbound (toward Lebak Bulus Grab, orderIndex 1):
 *   - Train departs Harmoni (orderIndex 16) at base time.
 *   - Each subsequent station gets +2 min per hop from Harmoni.
 *   - Lebak Bulus (orderIndex 1) has no southbound schedule (it's the terminus).
 */
function buildScheduleDocuments() {
  const docs: Array<{
    stationId: string;
    direction: 'northbound' | 'southbound';
    dayType: 'weekday' | 'weekend';
    departures: string[];
  }> = [];

  const minutesPerHop = 2;

  for (const dayType of ['weekday', 'weekend'] as const) {
    const blocks = dayType === 'weekday' ? weekdayBlocks : weekendBlocks;
    const baseDepartures = generateBaseDepartures(blocks);

    for (const station of stationsData) {
      // Northbound: toward Harmoni (orderIndex 16)
      // Trains originate at Lebak Bulus (orderIndex 1) and travel north.
      // Harmoni itself has no northbound departures.
      if (station.orderIndex < 16) {
        const hopsFromSouthTerminus = station.orderIndex - 1; // Lebak Bulus = 0 hops
        const offset = hopsFromSouthTerminus * minutesPerHop;
        docs.push({
          stationId: station.stationId,
          direction: 'northbound',
          dayType,
          departures: offsetDepartures(baseDepartures, offset),
        });
      }

      // Southbound: toward Lebak Bulus Grab (orderIndex 1)
      // Trains originate at Harmoni (orderIndex 16) and travel south.
      // Lebak Bulus itself has no southbound departures.
      if (station.orderIndex > 1) {
        const hopsFromNorthTerminus = 16 - station.orderIndex; // Harmoni = 0 hops
        const offset = hopsFromNorthTerminus * minutesPerHop;
        docs.push({
          stationId: station.stationId,
          direction: 'southbound',
          dayType,
          departures: offsetDepartures(baseDepartures, offset),
        });
      }
    }
  }

  return docs;
}

// ── Main seeder ──────────────────────────────────────────────────────

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Station.deleteMany();
    await Schedule.deleteMany();

    // Insert stations
    await Station.insertMany(stationsData);
    logger.info('✔ Stations seeded successfully');

    // Insert schedules
    const scheduleDocs = buildScheduleDocuments();
    await Schedule.insertMany(scheduleDocs);
    logger.info(`✔ Schedules seeded successfully (${scheduleDocs.length} documents)`);

    logger.info('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    logger.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

seedData();
