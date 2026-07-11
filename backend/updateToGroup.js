import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets } = await supabase.from('markets').select('*').like('question', '[Breaking]%');
  
  if (markets && markets.length > 0) {
    for (const m of markets) {
       let originalQ = m.question.replace('[Breaking] ', '');
       let newQ = '';
       
       if (originalQ.includes('Taj Mahal')) {
         let dateStr = originalQ.includes('Sep 2026') ? 'By Sep 2026' : 'By Nov 2026';
         newQ = '[GROUP:breaking-TajMahal] Could an Indian court rule that the Taj Mahal was originally a Shiva temple? ' + dateStr;
       } else if (originalQ.includes('cryptocurrency')) {
         newQ = '[GROUP:breaking-CryptoBan] Is India planning a complete ban on cryptocurrency trading? By Dec 2026';
       } else if (originalQ.includes('social media')) {
         newQ = '[GROUP:breaking-SocialMediaBan] Will India announce a nationwide social media ban for minors? By Dec 2026';
       }
       
       if (newQ !== '') {
         const { error } = await supabase.from('markets').update({ question: newQ }).eq('market_id', m.market_id);
         if (error) console.error('Failed to update', m.market_id, error);
         else console.log('✅ Updated to Grouped Format:', newQ);
       }
    }
  } else {
    console.log('Markets not found');
  }
}
run();
