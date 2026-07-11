import { supabase } from './utils/supabase.js';

async function run() {
  const { error: deleteError } = await supabase
    .from('markets')
    .delete()
    .like('question', '%[GROUP:elections-GoaElection2027]%');

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }
  console.log('✅ Deleted old Goa election markets');

  const partyOdds = [
    { name: 'Bharatiya Janata Party (BJP)', yes: 25, no: 25 },
    { name: 'Indian National Congress (INC)', yes: 11, no: 39 },
    { name: 'Aam Aadmi Party (AAP)', yes: 1, no: 49 },
    { name: 'Maharashtrawadi Gomantak Party (MGP)', yes: 1, no: 49 },
    { name: 'Goa Forward Party (GFP)', yes: 0, no: 50 },
    { name: 'Revolutionary Goans Party (RGP)', yes: 0, no: 50 },
    { name: 'All India Trinamool Congress (TMC)', yes: 0, no: 50 },
    { name: 'Nationalist Congress Party (NCP)', yes: 0, no: 50 },
    { name: 'Shiv Sena (UBT)', yes: 0, no: 50 },
    { name: 'Independent / Other', yes: 0, no: 50 }
  ];

  const customMarkets = partyOdds.map(p => {
    return {
      question: '[GROUP:elections-GoaElection2027] Which party will win the Goa Legislative Assembly election? ' + p.name,
      description: 'Resolves to YES for the political party that wins the highest number of seats (or forms the government) in the Goa Legislative Assembly election scheduled to be held in or before February 2027.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop',
      house_yes_points: p.yes,
      house_no_points: p.no,
      status: 'Active',
      end_date: new Date('2027-02-28T23:59:59Z').toISOString()
    };
  });

  const { error: insertError } = await supabase.from('markets').insert(customMarkets);
  if (insertError) console.error('Insert error:', insertError);
  else console.log('✅ Created 10 Goa election markets with realistic odds distribution!');
}
run();
