import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets, error } = await supabase.from('markets').select('market_id, question, category');
  if (error) {
    console.error(error);
    return;
  }
  
  const suspects = markets.filter(m => m.category === 'Politics' || m.question.includes('Shiv Sena') || m.question.includes('Supreme Court') || m.question.includes('Election'));
  
  console.log('Found ' + suspects.length + ' suspect markets left.');
}
run();
