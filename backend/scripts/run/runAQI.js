import { seedDataGovMarkets } from '../../cron/dataGovSeeder.js';
async function run() {
  await seedDataGovMarkets();
  console.log('Done!');
}
run();
