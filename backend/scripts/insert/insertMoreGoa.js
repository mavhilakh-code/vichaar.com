import { supabase } from './utils/supabase.js';

async function run() {
  const extraParties = [
    'Goa Forward Party (GFP)',
    'All India Trinamool Congress (TMC)',
    'Nationalist Congress Party (NCP)',
    'Shiv Sena (UBT)',
    'Independent / Other'
  ];

  const customMarkets = extraParties.map(party => {
    return {
      question: '[GROUP:elections-GoaElection2027] Which party will win the Goa Legislative Assembly election? ' + party,
      description: 'Resolves to YES for the political party that wins the highest number of seats (or forms the government) in the Goa Legislative Assembly election scheduled to be held in or before February 2027.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date('2027-02-28T23:59:59Z').toISOString()
    };
  });

  for (const market of customMarkets) {
    const { data: existing } = await supabase.from('markets').select('market_id').eq('question', market.question).single();
    if (!existing) {
       const { error } = await supabase.from('markets').insert([market]);
       if (error) console.error('Error inserting:', market.question, error);
       else console.log('✅ Created Extra Goa Election Market Option:', market.question);
    } else {
       console.log('Already exists:', market.question);
    }
  }
}
run();
