import { supabase } from './utils/supabase.js';
async function run() {
  const { data } = await supabase.from('markets').select('question, house_yes_points, house_no_points').ilike('question', '%[GROUP:elections-UttarPradesh2027]%');
  console.log(JSON.stringify(data, null, 2));
}
run();
