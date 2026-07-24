import { supabase } from './utils/supabase.js';

async function run() {
  const partyOdds = [
    { name: 'Bharatiya Janata Party (BJP)', yes: 25, no: 25 },
    { name: 'Indian National Congress (INC)', yes: 10, no: 40 },
    { name: 'Aam Aadmi Party (AAP)', yes: 0, no: 50 },
    { name: 'Maharashtrawadi Gomantak Party (MGP)', yes: 0, no: 50 },
    { name: 'Goa Forward Party (GFP)', yes: 0, no: 50 },
    { name: 'Revolutionary Goans Party (RGP)', yes: 0, no: 50 },
    { name: 'Independent / Other', yes: 0, no: 50 },
    { name: 'All India Trinamool Congress (TMC)', yes: 0, no: 50 },
    { name: 'Nationalist Congress Party (NCP)', yes: 0, no: 50 },
    { name: 'Shiv Sena (UBT)', yes: 0, no: 50 }
  ];

  for (const p of partyOdds) {
    const question = '[GROUP:elections-GoaElection2027] Which party will win the Goa Legislative Assembly election? ' + p.name;
    const { error } = await supabase
      .from('markets')
      .update({
        house_yes_points: p.yes,
        house_no_points: p.no
      })
      .eq('question', question);
      
    if (error) console.error('Failed to update:', p.name, error);
    else console.log('✅ Updated house points for:', p.name);
  }
}
run();
