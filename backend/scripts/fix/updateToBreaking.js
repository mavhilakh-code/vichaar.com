import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets } = await supabase.from('markets').select('*').in('question', [
    'Could an Indian court rule that the Taj Mahal was originally a Shiva temple by Sep 2026?',
    'Could an Indian court rule that the Taj Mahal was originally a Shiva temple by Nov 2026?',
    'Is India planning a complete ban on cryptocurrency trading by Dec 2026?',
    'Will India announce a nationwide social media ban for minors by Dec 2026?'
  ]);
  
  if (markets && markets.length > 0) {
    for (const m of markets) {
       // prepend [Breaking] to make them show up under Breaking category
       const newQ = '[Breaking] ' + m.question;
       const { error } = await supabase.from('markets').update({ question: newQ }).eq('market_id', m.market_id);
       if (error) console.error('Failed to update', m.market_id, error);
       else console.log('✅ Updated to Breaking:', newQ);
    }
  } else {
    console.log('Markets not found');
  }
}
run();
