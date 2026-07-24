import { supabase } from './utils/supabase.js';
async function run() {
  const { data } = await supabase.from('markets').select('question').ilike('question', '%metro%').limit(5);
  console.log(data);
}
run();
