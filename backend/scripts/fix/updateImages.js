import { supabase } from './utils/supabase.js';

const updates = [
  { keyword: 'taj+mahal+agra', q: 'Taj Mahal' },
  { keyword: 'cryptocurrency+ban+regulation', q: 'cryptocurrency' },
  { keyword: 'social+media+phone+teenager', q: 'social media ban' },
  { keyword: 'stock+market+india+sensex', q: 'Indian stock market' },
  { keyword: 'bollywood+cinema+movie', q: 'Dhamaal' },
  { keyword: 'ebola+virus+health', q: 'Ebola' },
];

async function run() {
  const { data: markets } = await supabase.from('markets').select('market_id, question').eq('category', 'Politics');
  for (const m of (markets || [])) {
    if (!m.question.startsWith('[Breaking]')) continue;
    const qLower = m.question.toLowerCase();
    for (const u of updates) {
      if (qLower.includes(u.q.toLowerCase())) {
        await supabase.from('markets').update({
          image_url: 'https://source.unsplash.com/400x200/?' + u.keyword
        }).eq('market_id', m.market_id);
        console.log('Updated image for:', m.question.substring(0, 60));
        break;
      }
    }
  }
  console.log('Done!');
}

run();
