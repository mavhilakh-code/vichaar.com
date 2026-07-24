import { seedWeatherMarkets } from './cron/weatherSeeder.js';

import dotenv from 'dotenv';
dotenv.config();

seedWeatherMarkets().catch(console.error);
