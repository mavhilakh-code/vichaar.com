import { supabase } from './utils/supabase.js';
async function run() {
  const { data: allMarkets } = await supabase.from('markets').select('*').ilike('question', '%[GROUP:elections-UttarPradesh2027]%');
  
  for (const m of allMarkets) {
    let yes = 1;
    let no = 49;
    if (m.question.includes('Samajwadi Party (SP)')) { yes = 15; no = 35; }
    else if (m.question.includes('BSP)')) { yes = 3; no = 47; }
    else if (m.question.includes('INC)')) { yes = 2; no = 48; }
    else if (m.question.includes('RLD)')) { yes = 1; no = 49; }
    else if (m.question.includes('AD(S)')) { yes = 1; no = 49; }
    else if (m.question.includes('Nishad')) { yes = 1; no = 49; }
    else if (m.question.includes('ASP')) { yes = 1; no = 49; }
    else if (m.question.includes('SBSP)')) { yes = 1; no = 49; }
    else { yes = 0; no = 50; } // Independent
    
    await supabase.from('markets').update({ house_yes_points: yes, house_no_points: no }).eq('market_id', m.market_id);
    console.log(\Fixed \ -> \ yes\);
  }

  // Check if BJP exists, if not insert it!
  const hasBJP = allMarkets.some(m => m.question.includes('BJP'));
  if (!hasBJP) {
     const bjpQuestion = '[GROUP:elections-UttarPradesh2027] Which party or alliance will win the Uttar Pradesh Legislative Assembly election? Bharatiya Janata Party (BJP)';
     await supabase.from('markets').insert([{
       question: bjpQuestion,
       description: 'This market resolves to YES for the political party or alliance that wins the most seats.',
       category: 'Politics',
       image_url: null,
       house_yes_points: 25,
       house_no_points: 25,
       status: 'Active',
       end_date: '2027-03-31T23:59:59Z'
     }]);
     console.log(\✅ Re-inserted missing BJP market!\);
  }
}
run();
