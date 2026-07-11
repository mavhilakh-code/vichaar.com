
import { supabase } from './utils/supabase.js';
async function run() {
  const { data, error } = await supabase.rpc('get_markets_categories');
  console.log(data, error);
}
run();
