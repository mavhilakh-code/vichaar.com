import { supabase } from './utils/supabase.js';
async function run() {
  const { data: allMarkets } = await supabase.from('markets').select('*').ilike('question', '%[GROUP:elections-Manipur2027]%');
  
  for (const m of allMarkets) {
    let yes = 1;
    let no = 49;
    
    // Total seats in Manipur is 60. Current realistic prediction baseline (not 100% accurate, but fair starting point):
    if (m.question.includes('BJP')) { yes = 32; no = 68; } // Slightly favored to win majority
    else if (m.question.includes('INC')) { yes = 25; no = 75; }
    else if (m.question.includes('NPP')) { yes = 8; no = 92; }
    else if (m.question.includes('NPF')) { yes = 5; no = 95; }
    else if (m.question.includes('JD(U)')) { yes = 4; no = 96; }
    else if (m.question.includes('KPA')) { yes = 2; no = 98; }
    else if (m.question.includes('CPI')) { yes = 1; no = 99; }
    else if (m.question.includes('AITC')) { yes = 1; no = 99; }
    else if (m.question.includes('AAP')) { yes = 1; no = 99; }
    else { yes = 0; no = 100; } // Independent
    
    // Scale everything down by a factor of 2 so base liquidity is ~50 per option (helps percentages math later)
    yes = Math.round(yes / 2);
    no = Math.round(no / 2);
    // Make sure we have at least 50 points total for getTrueVolume
    if ((yes + no) < 50) {
        no = 50 - yes;
    }

    await supabase.from('markets').update({ house_yes_points: yes, house_no_points: no }).eq('market_id', m.market_id);
    console.log(\Fixed \ -> \ yes, \ no\);
  }
}
run();
