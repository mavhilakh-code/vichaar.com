import { supabase } from './utils/supabase.js';
async function run() {
  const { data: allMarkets } = await supabase.from('markets').select('*').ilike('question', '%[GROUP:elections-Punjab2027]%');
  
  for (const m of allMarkets) {
    let yes = 1;
    let no = 49;
    
    // Punjab has 117 seats. Current ruling party is AAP.
    if (m.question.includes('AAP')) { yes = 45; no = 55; }
    else if (m.question.includes('INC')) { yes = 30; no = 70; }
    else if (m.question.includes('BJP')) { yes = 15; no = 85; }
    else if (m.question.includes('SAD')) { yes = 8; no = 92; }
    else if (m.question.includes('BSP')) { yes = 1; no = 99; }
    else { yes = 0; no = 100; } // Independent
    
    // Scale down to base liquidity ~50 to fix math
    yes = Math.round(yes / 2);
    no = Math.round(no / 2);
    if ((yes + no) < 50) {
        no = 50 - yes;
    }

    await supabase.from('markets').update({ house_yes_points: yes, house_no_points: no }).eq('market_id', m.market_id);
    console.log(\Fixed \ -> \ yes, \ no\);
  }
}
run();
