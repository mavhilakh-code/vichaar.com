import { seedBreakingMarkets } from './backend/cron/breakingSeeder.js';
seedBreakingMarkets().then(() => console.log('Done')).catch(console.error);
