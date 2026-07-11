import { supabase } from './utils/supabase.js';
async function run() {
  const { data } = await supabase.from('markets').select('market_id, question, status').ilike('question', '%above%');
  console.log('Markets count:', data.length);
  console.log(data.slice(0, 3));
}
run();
