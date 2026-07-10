import { supabase } from '../utils/supabase.js';
import axios from 'axios';
import Groq from 'groq-sdk';

export async function seedBreakingMarkets() {
  console.log("🚀 [Cron] Starting Breaking News Seeder (Groq + GNews)...");

  try {
    const groqKey = process.env.GROQ_API_KEY;
    const gnewsKey = process.env.GNEWS_API_KEY;
    
    if (!groqKey || !gnewsKey) {
      throw new Error("Missing GROQ_API_KEY or GNEWS_API_KEY");
    }

    // 1. Fetch Live Breaking News for India
    console.log("📡 Fetching live breaking news from GNews...");
    const gnewsRes = await axios.get(`https://gnews.io/api/v4/top-headlines?category=breaking-news&country=in&lang=en&max=10&apikey=${gnewsKey.trim()}`);
    
    const articles = gnewsRes.data.articles || [];
    if (articles.length === 0) {
      console.log("No breaking news found at this moment.");
      return;
    }

    const newsSummary = articles.map(a => `- ${a.title}: ${a.description}`).join("\n");
    
    // 2. Pass to Groq (Llama 3.3 70B) to generate markets
    const groq = new Groq({ apiKey: groqKey });
    
    const prompt = `You are a prediction market creator. I will provide you with the latest breaking news headlines and summaries from India.
Read them and generate the top 3 most interesting binary (Yes/No) prediction market questions that will resolve within the next 3 to 7 days.
Prefix each question exactly with "[Breaking] ".
The description should give brief context about why this is breaking news based on the summary provided.
The end_date must be in ISO format (YYYY-MM-DDTHH:MM:SSZ) and be between 3 and 7 days from now.
Also provide a short image_keyword (1-2 words) for each market that represents the topic visually, e.g. "parliament", "bitcoin", "temple", "social media".
Respond ONLY with a valid JSON array. No markdown, no introductory text.

Headlines:
${newsSummary}

Format exactly like this:
[
  {
    "question": "[Breaking] Will the Supreme Court grant bail to [Person] by Friday?",
    "description": "Context about the breaking news...",
    "end_date": "2024-11-20T23:59:59Z",
    "image_keyword": "supreme court"
  }
]`;

    console.log("🧠 Asking Groq to generate breaking markets...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    let content = chatCompletion.choices[0]?.message?.content || "";
    
    // Strip markdown formatting
    if (content.startsWith("```json")) content = content.slice(7);
    if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    content = content.trim();

    let markets;
    try {
      markets = JSON.parse(content);
    } catch (err) {
      console.error("❌ Failed to parse JSON from Groq:", content);
      return;
    }

    let insertedCount = 0;
    for (const m of markets) {
      // Validate date
      const endDate = new Date(m.end_date);
      if (isNaN(endDate.getTime()) || endDate < new Date()) {
        console.warn("Skipping market with invalid or past end_date:", m.question);
        continue;
      }

      // Ensure prefix
      let question = m.question;
      if (!question.startsWith("[Breaking]")) {
        question = "[Breaking] " + question;
      }

      // Check if already exists to prevent duplicates
      const { data: existing } = await supabase.from('markets').select('market_id').eq('question', question).single();
      if (existing) continue;

      const { error } = await supabase.from('markets').insert({
        question: question,
        description: m.description,
        category: 'Politics', // Map to Politics for DB constraint, frontend overrides to Breaking
        end_date: m.end_date,
        image_url: m.image_keyword
          ? `https://source.unsplash.com/400x200/?${encodeURIComponent(m.image_keyword)}`
          : `https://source.unsplash.com/400x200/?breaking+news+india`,
        status: 'Active',
        house_yes_points: 0,
        house_no_points: 0,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error("❌ Failed to insert market:", question, error);
      } else {
        insertedCount++;
        console.log(`✅ Created breaking market: ${question}`);
      }
    }

    console.log(`🏁 [Cron] Breaking News Seeder finished. Created ${insertedCount} markets.`);

  } catch (error) {
    console.error("❌ Breaking News Seeder error:", error.message);
  }
}
