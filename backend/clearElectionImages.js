import { supabase } from './utils/supabase.js';
async function run() {
  const { error } = await supabase.from('markets').update({ image_url: null }).ilike('question', '%[GROUP:elections-%');
  if (error) console.error('Error:', error);
  else console.log('✅ Cleared image_urls for election markets');
}
run();
