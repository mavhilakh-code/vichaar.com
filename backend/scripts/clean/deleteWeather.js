import { supabase } from './utils/supabase.js';
async function run() {
  const { data: markets } = await supabase.from('markets').select('market_id').ilike('question', '%above%°C on%');
  if (markets && markets.length > 0) {
    const ids = markets.map(m => m.market_id);
    await supabase.from('markets').delete().in('market_id', ids);
    console.log(\Deleted \ weather markets\);
  } else {
    console.log('No weather markets found');
  }
}
run();
