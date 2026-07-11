
import { supabase } from './utils/supabase.js';

async function run() {
  const { data, error } = await supabase.from('markets').select('market_id, house_yes_points, house_no_points').eq('category', 'Weather').limit(3);
  console.log(data);
}
run();
