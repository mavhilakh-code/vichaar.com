import { supabase } from './utils/supabase.js';

async function run() {
  const { error } = await supabase
    .from('markets')
    .update({ image_url: null })
    .like('question', '%[GROUP:elections-GoaElection2027]%');

  if (error) console.error(error);
  else console.log('✅ Removed logos from Goa Election markets');
}
run();
