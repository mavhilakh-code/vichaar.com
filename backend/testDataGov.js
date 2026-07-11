import dotenv from 'dotenv';
dotenv.config();

import { seedDataGovMarkets } from './cron/dataGovSeeder.js';

async function run() {
  await seedDataGovMarkets();
}
run();
