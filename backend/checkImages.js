import { supabase } from './utils/supabase.js';
async function run() {
  const { data } = await supabase.from('markets').select('image_url').ilike('question', '%[GROUP:elections-UttarPradesh2027]%').limit(1);
  console.log(data);
}
run();
