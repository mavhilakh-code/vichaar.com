import axios from "axios";
import { supabase } from "../utils/supabase.js";
import { GoogleGenAI } from "@google/genai";
import { getImageForQuestion } from "../utils/imageHelper.js";

const BASE_LIQUIDITY = 50;

async function seedWikipediaMarkets() {
  console.log("📚 [Cron] Starting Wikipedia Indian Elections Seeder...");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing. Skipping Wikipedia elections seeder.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let createdCount = 0;

  try {
    // 1. Search Wikipedia for upcoming state/UT elections in India
    // We target 2026 and 2027 elections
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=intitle:%22Legislative%20Assembly%20election%22%202026%20OR%202027%20India&utf8=&format=json`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'VichaarApp/1.0 (contact@example.com)' }
    });

    const searchResults = searchRes.data?.query?.search || [];
    if (searchResults.length === 0) {
      console.log("No upcoming election articles found on Wikipedia.");
      return;
    }

    // Filter and take top 5 elections
    const electionArticles = searchResults
      .filter(r => r.title.toLowerCase().includes("legislative assembly election"))
      .slice(0, 5);

    for (const article of electionArticles) {
      try {
        console.log(`\n📖 Fetching details for: "${article.title}"`);
        
        // 2. Fetch page extract (intro summary)
        const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&exintro&titles=${encodeURIComponent(article.title)}&format=json`;
        const extractRes = await axios.get(extractUrl, {
          headers: { 'User-Agent': 'VichaarApp/1.0' }
        });

        const pages = extractRes.data?.query?.pages || {};
        const pageId = Object.keys(pages)[0];
        const extractText = pages[pageId]?.extract || "";

        if (!extractText) {
          console.log(`⚠️ No extract text found for ${article.title}. Skipping.`);
          continue;
        }

        // 3. Prompt Gemini to extract parties and assign odds based on the article intro
        const prompt = `
You are a prediction market creator. Read the following Wikipedia introduction for an upcoming Indian state legislative assembly election:
"${extractText}"

Generate a list of the top 3-6 major competing political parties or political alliances (e.g. BJP, INC, DMK, AIADMK, MVA, NDA, AAP, etc.) likely to contest or win this election, plus a mandatory "Independent / Other" option.

For each party/alliance, assign starting YES and NO points that sum exactly to 50 (e.g. yes: 10, no: 40) based on their relative strength or popularity described in the text or previous results:
- If a party is the current ruling party or strong favorite, set it higher (e.g. yes: 25, no: 25).
- If it is the major opposition party, set it mid-low (e.g. yes: 10, no: 40).
- If it is a smaller party, set it very low (e.g. yes: 1, no: 49 or yes: 0, no: 50).

Generate a unique group identifier (e.g. "elections-TamilNadu2026") and the main question title (e.g. "Which party or alliance will win the Tamil Nadu Legislative Assembly election?").
Also estimate the election date based on the text. Default to the end of the expected election month or year (e.g. "2026-05-31T23:59:59Z").

Return a JSON object exactly in this format, with no markdown formatting or backticks around it:
{
  "groupId": "elections-TamilNadu2026",
  "questionTitle": "Which party or alliance will win the Tamil Nadu Legislative Assembly election?",
  "endDate": "2026-05-31T23:59:59Z",
  "description": "This market resolves to YES for the political party or alliance that wins...",
  "options": [
    { "name": "DMK-led Alliance (Secular Progressive Alliance)", "yes": 25, "no": 25 },
    { "name": "AIADMK-led Alliance", "yes": 14, "no": 36 },
    { "name": "Bharatiya Janata Party (BJP)", "yes": 2, "no": 48 },
    { "name": "Independent / Other", "yes": 0, "no": 50 }
  ]
}
`;

        console.log(`🧠 Asking Gemini to parse and structure markets...`);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text.trim();
        let parsedData;
        try {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleanText);
        } catch (parseErr) {
          console.error("❌ Failed to parse Gemini response for:", article.title);
          continue;
        }

        // 4. Create and insert the markets into Supabase
        const groupTitle = parsedData.questionTitle;
        const groupId = parsedData.groupId;
        const endDate = parsedData.endDate;
        const desc = parsedData.description;

        // Skip if the election has already occurred (past endDate)
        const dateObj = new Date(endDate);
        if (isNaN(dateObj.getTime()) || dateObj < new Date()) {
           console.log(`⚠️ Skipping past or invalid election: ${groupTitle} (Date: ${endDate})`);
           continue;
        }

        for (const opt of (parsedData.options || [])) {
          const fullQuestion = `[GROUP:${groupId}] ${groupTitle} ${opt.name}`;

          // Check if already exists to prevent duplicate runs
          const { data: existing } = await supabase
            .from('markets')
            .select('market_id')
            .eq('question', fullQuestion)
            .single();

          if (!existing) {
            const { error } = await supabase.from('markets').insert([{
              question: fullQuestion,
              description: desc,
              category: 'Politics', // Maps to Politics in DB, frontend handles Elections tag
              image_url: null,
              house_yes_points: opt.yes,
              house_no_points: opt.no,
              status: 'Active',
              end_date: endDate
            }]);

            if (error) {
              console.error(`❌ Failed to insert election option: ${fullQuestion}`, error);
            } else {
              console.log(`   ✅ Created election option: ${fullQuestion} (${Math.round(opt.yes / 50 * 100)}% starting odds)`);
              createdCount++;
            }
          }
        }

      } catch (innerError) {
        console.error(`❌ Error parsing article ${article.title}:`, innerError.message);
      }
    }

  } catch (error) {
    console.error("❌ Wikipedia Elections Seeder error:", error.message);
  }

  console.log(`🏁 [Cron] Wikipedia Indian Elections Seeder finished. Created ${createdCount} markets.`);
}

export { seedWikipediaMarkets };
