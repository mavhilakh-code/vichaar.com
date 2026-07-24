import { supabase } from './utils/supabase.js';
async function check() {
  const { data } = await supabase.from('markets').select('market_id, question').ilike('question', '%AQI%');
  console.log('AQI Markets:', data);
}
check();
