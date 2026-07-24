import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets, error } = await supabase.from('markets').select('market_id, question, category');
  if (error) {
    console.error(error);
    return;
  }
  
  const suspects = markets.filter(m => m.category === 'Politics' || m.question.includes('Shiv Sena') || m.question.includes('[Breaking]') || m.question.includes('Major developments'));
  
  console.log('Found ' + suspects.length + ' suspect markets.');
  
  if (suspects.length > 0) {
    const ids = suspects.map(m => m.market_id);
    const { error: delError } = await supabase.from('markets').delete().in('market_id', ids);
    if (delError) {
       console.error('Delete error:', delError);
    } else {
       console.log('Deleted ' + ids.length + ' political/breaking markets.');
    }
  }
}
run();
