import { supabase } from './utils/supabase.js';

async function run() {
  // Delete the renovation taj mahal group
  const { data: existing } = await supabase.from('markets')
    .select('market_id, question')
    .ilike('question', '%Taj Mahal%');
  
  if (existing) {
    for (const m of existing) {
      await supabase.from('markets').delete().eq('market_id', m.market_id);
    }
  }

  // Create new grouped market with the Tejo Mahalaya theme
  const newGroup = {
    title: "[GROUP:breaking-Could an Indian court rule that the Taj Mahal was originally a Shiva temple?] ",
    description: "Various petitions have been filed in Indian courts claiming that the Taj Mahal was originally a Hindu temple known as Tejo Mahalaya. This market resolves to YES if any recognized Indian court officially rules in favor of this claim.",
    image_keyword: "taj mahal",
    category: "Politics", // Using Politics to ensure it inserts safely
    imgUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc0NjF8MHwxfHNlYXJjaHwxfHxUYWolMjBNYWhhbHxlbnwwfHx8fDE3MjA2MDA1NDR8MA&ixlib=rb-4.0.3&q=80&w=1080",
    options: [
      { name: "By Sep 2026", end_date: "2026-09-30T23:59:59Z" },
      { name: "By Nov 2026", end_date: "2026-11-30T23:59:59Z" }
    ]
  };

  for (const opt of newGroup.options) {
    const questionText = newGroup.title + opt.name;
    const { error } = await supabase.from('markets').insert({
      question: questionText,
      description: newGroup.description,
      category: newGroup.category,
      end_date: opt.end_date,
      image_url: newGroup.imgUrl,
      status: 'Active',
      house_yes_points: 100,
      house_no_points: 100,
    });
    if (error) console.error("Insert error:", error);
    else console.log("Inserted:", questionText);
  }
}

run();
