import { supabase } from './utils/supabase.js';

async function run() {
  const updates = [
    {
      group: 'breaking-CryptoBan',
      oldStr: 'By Dec 2026',
      newStr: 'By 31 December 2026'
    },
    {
      group: 'breaking-SocialMediaBan',
      oldStr: 'By Dec 2026',
      newStr: 'By 31 December 2026'
    }
  ];

  for (const u of updates) {
    const { data } = await supabase.from('markets').select('*').like('question', '%[GROUP:' + u.group + ']%' + u.oldStr + '%');
    if (data && data.length > 0) {
      for (const m of data) {
         const newQ = m.question.replace(u.oldStr, u.newStr);
         const { error } = await supabase.from('markets').update({ question: newQ }).eq('market_id', m.market_id);
         if (!error) console.log('✅ Updated ' + m.market_id + ' to: ' + newQ);
      }
    }
  }
}
run();
