import { supabase } from './utils/supabase.js';
async function run() {
  const { data } = await supabase.from('markets').select('market_id, question, house_yes_points, house_no_points').ilike('question', '%[GROUP:elections-Manipur2027]%');
  console.log(data);
}
run();
