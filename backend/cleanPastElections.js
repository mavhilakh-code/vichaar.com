import { supabase } from './utils/supabase.js';

async function run() {
  const { error: error1 } = await supabase
    .from('markets')
    .delete()
    .like('question', '%[GROUP:elections-UttarPradesh2022]%');

  const { error: error2 } = await supabase
    .from('markets')
    .delete()
    .like('question', '%[GROUP:elections-UttarPradesh1993]%');

  if (error1 || error2) console.error('Delete error:', error1, error2);
  else console.log('✅ Cleaned up past election markets (1993 and 2022)');
}
run();
