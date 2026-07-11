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
    { 
      name: 'Bharatiya Janata Party (BJP)', 
      yes: 25, 
      no: 25, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/240px-Bharatiya_Janata_Party_logo.svg.png' 
    },
    { 
      name: 'Indian National Congress (INC)', 
      yes: 14, 
      no: 36, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Indian_National_Congress_hand_logo.svg/240px-Indian_National_Congress_hand_logo.svg.png' 
    },
    { 
      name: 'Aam Aadmi Party (AAP)', 
      yes: 3, 
      no: 47, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Aam_Aadmi_Party_logo_%28English%29.svg/240px-Aam_Aadmi_Party_logo_%28English%29.svg.png' 
    },
    { 
      name: 'Maharashtrawadi Gomantak Party (MGP)', 
      yes: 3, 
      no: 47, 
      img: 'https://images.unsplash.com/photo-1602491453979-02654b52720e?q=80&w=200&auto=format&fit=crop'
    },
    { 
      name: 'Goa Forward Party (GFP)', 
      yes: 1, 
      no: 49, 
      img: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=200&auto=format&fit=crop'
    },
    { 
      name: 'Revolutionary Goans Party (RGP)', 
      yes: 1, 
      no: 49, 
      img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=200&auto=format&fit=crop'
    },
    { 
      name: 'Independent / Other', 
      yes: 4, 
      no: 46, 
      img: 'https://images.unsplash.com/photo-1593006512330-1f190e527af3?q=80&w=200&auto=format&fit=crop'
    },
    { 
      name: 'All India Trinamool Congress (TMC)', 
      yes: 0, 
      no: 50, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/All_India_Trinamool_Congress_symbol.svg/240px-All_India_Trinamool_Congress_symbol.svg.png' 
    },
    { 
      name: 'Nationalist Congress Party (NCP)', 
      yes: 0, 
      no: 50, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nationalist_Congress_Party_Party_Symbol.svg/240px-Nationalist_Congress_Party_Party_Symbol.svg.png' 
    },
    { 
      name: 'Shiv Sena (UBT)', 
      yes: 0, 
      no: 50, 
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Shiv_Sena_symbol.svg/240px-Shiv_Sena_symbol.svg.png' 
    }
  ];

  const customMarkets = partyOdds.map(p => {
    return {
      question: '[GROUP:elections-GoaElection2027] Which party will win the Goa Legislative Assembly election? ' + p.name,
      description: 'Resolves to YES for the political party that wins the highest number of seats (or forms the government) in the Goa Legislative Assembly election scheduled to be held in or before February 2027. Seat distribution matches 2022 Wikipedia results.',
      category: 'Politics',
      image_url: p.img,
      house_yes_points: p.yes,
      house_no_points: p.no,
      status: 'Active',
      end_date: new Date('2027-02-28T23:59:59Z').toISOString()
    };
  });

  const { error: insertError } = await supabase.from('markets').insert(customMarkets);
  if (insertError) console.error('Insert error:', insertError);
  else console.log('✅ Created 10 Goa election markets with precise Wiki 2022 seat-count odds and logos!');
}
run();
