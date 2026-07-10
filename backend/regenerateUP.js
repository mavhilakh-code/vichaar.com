import { supabase } from './utils/supabase.js';
import { seedWikipediaMarkets } from './cron/wikipediaSeeder.js';

async function run() {
  const { error } = await supabase.from('markets').delete().ilike('question', '%[GROUP:elections-UttarPradesh2027]%');
  if (error) {
    console.error('Delete error:', error);
    return;
  }
  console.log('✅ Deleted existing Uttar Pradesh 2027 markets AGAIN. Regenerating with AI-knowledge limit...');
  await seedWikipediaMarkets();
}
run();
