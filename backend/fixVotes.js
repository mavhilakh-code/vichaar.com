import { supabase } from './utils/supabase.js';

async function fix() {
  const { data: markets, error } = await supabase.from('markets').select('market_id, question, house_yes_points, house_no_points').eq('category', 'Politics');
  if (error) { console.error(error); return; }
  
  for (const m of markets) {
    if (m.question.startsWith('[Breaking]') && m.house_yes_points >= 50 && m.house_no_points >= 50) {
      await supabase.from('markets').update({ 
        house_yes_points: m.house_yes_points - 50, 
        house_no_points: m.house_no_points - 50 
      }).eq('market_id', m.market_id);
      console.log('Fixed:', m.question);
    }
  }
}
fix();
