import dotenv from 'dotenv';
dotenv.config();

import { seedMarkets } from './cron/marketSeeder.js';

async function run() {
  console.log('Manually triggering market seeders to populate database...');
  await seedMarkets();
  console.log('Seeding complete!');
}
run();
