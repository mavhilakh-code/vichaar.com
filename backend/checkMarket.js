
import { supabase } from './utils/supabase.js';

async function run() {
  const { data, error } = await supabase.from('markets').select('*').limit(1);
  console.log(data);
}
run();
