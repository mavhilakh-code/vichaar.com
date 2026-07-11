import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets, error } = await supabase.from('markets').select('market_id, question, category');
  if (error) {
    console.error(error);
    return;
  }
  
  // Let's filter markets that might be political
  const suspects = markets.filter(m => m.question.includes('Major developments this week') || m.question.includes('Shiv Sena') || m.category === 'Politics' || m.question.includes('[Breaking]'));
  
  console.log(Found  suspect markets.);
  suspects.slice(0, 10).forEach(m => console.log(- [] ));
}
run();
