import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { supabase } from "../utils/supabase.js";
import { resolveMarket } from "../controllers/marketController.js";

async function askGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 500
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

async function askOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");
  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: 'perplexity/sonar',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 500
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:5173', 
      'X-Title': 'Vichaar',
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

const wbCountryMap = { 'United States': 'US', 'China': 'CN', 'India': 'IN', 'Japan': 'JP', 'Germany': 'DE' };
const imfCountryMap = { 'United States': 'USA', 'China': 'CHN', 'India': 'IND', 'Japan': 'JPN', 'Germany': 'DEU' };

async function resolveWorldBankMarket(market) {
  console.log(`   🌐 Parsing World Bank Market...`);
  // [WB] India GDP Growth above 7.0% in 2026?
  const regex = /^\[WB\] (.*?) (GDP Growth|Inflation) (above|below) (.*?)% in (\d{4})\?$/;
  const match = market.question.match(regex);
  
  if (!match) return null;
  const [ , countryName, metricName, condition, thresholdStr, yearStr ] = match;
  
  const countryCode = wbCountryMap[countryName];
  const indicatorCode = metricName === 'GDP Growth' ? 'NY.GDP.MKTP.KD.ZG' : 'FP.CPI.TOTL.ZG';
  const threshold = parseFloat(thresholdStr);
  const year = parseInt(yearStr);

  if (!countryCode) return null;

  try {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&date=${year}`;
    const response = await axios.get(url);
    if (response.data && response.data[1] && response.data[1][0] && response.data[1][0].value !== null) {
      const actualValue = response.data[1][0].value;
      console.log(`   📊 WB API Data for ${year}: ${actualValue} (Target: ${condition} ${threshold})`);
      
      let isYes = false;
      if (condition === 'above' && actualValue > threshold) isYes = true;
      if (condition === 'below' && actualValue < threshold) isYes = true;

      return {
        outcome: isYes ? 'YES' : 'NO',
        reason: `The World Bank reported ${metricName} for ${countryName} in ${year} as ${actualValue.toFixed(2)}%, which is ${isYes ? '' : 'not '}${condition} the threshold of ${threshold}%.`
      };
    } else {
       console.log(`   ⏳ Data not yet available from World Bank for ${year}. Need to extend expiration.`);
       return { outcome: 'EXTEND' };
    }
  } catch (err) {
    console.error("   ❌ Error fetching from World Bank:", err.message);
    return null;
  }
}

async function resolveIMFMarket(market) {
  console.log(`   🌐 Parsing IMF Market...`);
  // [IMF] India Unemployment below 5.0% in 2026?
  // [IMF] India Current Account above -1.0% of GDP in 2026?
  const regex = /^\[IMF\] (.*?) (Unemployment|Current Account) (above|below) (.*?)%(?: of GDP)? in (\d{4})\?$/;
  const match = market.question.match(regex);

  if (!match) return null;
  const [ , countryName, metricName, condition, thresholdStr, yearStr ] = match;
  
  const countryCode = imfCountryMap[countryName];
  const indicatorCode = metricName === 'Unemployment' ? 'LUR' : 'BCA_NGDPD';
  const threshold = parseFloat(thresholdStr);
  const year = parseInt(yearStr);

  if (!countryCode) return null;

  try {
    const url = `https://www.imf.org/external/datamapper/api/v1/${indicatorCode}?periods=${year}`;
    const response = await axios.get(url);
    
    const dataMap = response.data.values[indicatorCode];
    if (dataMap && dataMap[countryCode] && dataMap[countryCode][year] !== undefined) {
      const actualValue = dataMap[countryCode][year];
      console.log(`   📊 IMF API Data for ${year}: ${actualValue} (Target: ${condition} ${threshold})`);
      
      let isYes = false;
      if (condition === 'above' && actualValue > threshold) isYes = true;
      if (condition === 'below' && actualValue < threshold) isYes = true;

      return {
        outcome: isYes ? 'YES' : 'NO',
        reason: `The IMF reported ${metricName} for ${countryName} in ${year} as ${actualValue.toFixed(2)}%, which is ${isYes ? '' : 'not '}${condition} the threshold of ${threshold}%.`
      };
    } else {
       console.log(`   ⏳ Data not yet available from IMF for ${year}. Need to extend expiration.`);
       return { outcome: 'EXTEND' };
    }
  } catch (err) {
    console.error("   ❌ Error fetching from IMF:", err.message);
    return null;
  }
}


async function resolveExpiredMarkets() {
  console.log("🤖 [Cron] Starting Market Resolver...");

  try {
    const now = new Date().toISOString();
    
    // 1. Fetch expired active markets
    const { data: expiredMarkets, error } = await supabase
      .from('markets')
      .select('market_id, question, description, end_date, status')
      .eq('status', 'Active')
      .lt('end_date', now)
      .limit(5);

    if (error) throw error;

    if (!expiredMarkets || expiredMarkets.length === 0) {
      console.log("✅ No expired markets need resolution right now.");
      return;
    }

    console.log(`🔍 Found ${expiredMarkets.length} expired markets. Resolving...`);
    let resolvedCount = 0;

    for (const market of expiredMarkets) {
      try {
        console.log(`\n🧠 Resolving Market ID ${market.market_id}: "${market.question}"`);
        let result = null;

        // -- DETERMINISTIC API RESOLVERS --
        if (market.question.startsWith("[WB]")) {
           result = await resolveWorldBankMarket(market);
        } else if (market.question.startsWith("[IMF]")) {
           result = await resolveIMFMarket(market);
        }

        // -- EXTEND EXPIRATION IF API DATA NOT READY --
        if (result && result.outcome === 'EXTEND') {
           const newEndDate = new Date();
           newEndDate.setDate(newEndDate.getDate() + 7); // check again in 7 days
           await supabase.from('markets').update({ end_date: newEndDate.toISOString() }).eq('market_id', market.market_id);
           console.log(`   📅 Extended market expiration by 7 days.`);
           continue;
        }

        // -- FALLBACK TO AI FOR OTHER MARKETS --
        if (!result) {
            const prompt = `
You are an automated prediction market resolution oracle.
You have access to facts to check real-time events.
Please resolve the following prediction market that has just ended.

Market Question: "${market.question}"
Market Description: "${market.description}"
End Date: ${market.end_date}

Instructions:
- Determine if this event definitively occurred or the condition was met by the end date.
- If the event occurred and the condition was met, the outcome is "YES".
- If the event definitively did NOT occur, or the condition failed, the outcome is "NO".
- If the outcome is still ambiguous, the event hasn't finished, or you cannot find reliable proof, the outcome is "UNRESOLVED".

Return ONLY a JSON object in this format (no markdown, no backticks, no other text):
{
  "outcome": "YES" | "NO" | "UNRESOLVED",
  "reason": "Short explanation of why you chose this outcome."
}
`;
            if (market.question.startsWith("[Breaking]")) {
               console.log(`   ⚡ [Breaking] market detected. Asking OpenRouter (Perplexity Sonar Online)...`);
               try {
                   const text = await askOpenRouter(prompt);
                   let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                   const startIdx = cleanText.indexOf('{');
                   const endIdx = cleanText.lastIndexOf('}');
                   if (startIdx !== -1 && endIdx !== -1) {
                     cleanText = cleanText.substring(startIdx, endIdx + 1);
                   }
                   result = JSON.parse(cleanText);
               } catch (orErr) {
                   console.error(`   ❌ OpenRouter failed:`, orErr.message);
                   result = { outcome: "UNRESOLVED", reason: "AI provider failed." };
               }
            } else {
              try {
                 console.log(`   ⚡ Asking Groq (Llama 3.3 70B)...`);
                 const text = await askGroq(prompt);
                 let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                 const startIdx = cleanText.indexOf('{');
                 const endIdx = cleanText.lastIndexOf('}');
                 if (startIdx !== -1 && endIdx !== -1) {
                   cleanText = cleanText.substring(startIdx, endIdx + 1);
                 }
                 result = JSON.parse(cleanText);
                 
                 if (!result.outcome || result.outcome === 'UNRESOLVED') {
                     throw new Error("Groq returned UNRESOLVED or invalid output");
                 }
              } catch (groqErr) {
                 console.log(`   ⚠️ Groq couldn't resolve definitively. Falling back to OpenRouter (Perplexity Sonar Online)...`);
                 try {
                     const text = await askOpenRouter(prompt);
                   let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                   const startIdx = cleanText.indexOf('{');
                   const endIdx = cleanText.lastIndexOf('}');
                   if (startIdx !== -1 && endIdx !== -1) {
                     cleanText = cleanText.substring(startIdx, endIdx + 1);
                   }
                   result = JSON.parse(cleanText);
                 } catch (orErr) {
                     console.error(`   ❌ OpenRouter also failed.`);
                     result = { outcome: "UNRESOLVED", reason: "All AI providers failed." };
                 }
              }
            }
        }

        console.log(`   Outcome: ${result?.outcome}`);
        console.log(`   Reason: ${result?.reason}`);

        if (result?.outcome === 'UNRESOLVED') {
          console.log(`   ⚠️ AI returned UNRESOLVED. Defaulting to CANCEL to refund users and clear backlog.`);
          result.outcome = 'CANCEL';
        }

        if (result && (result.outcome === 'YES' || result.outcome === 'NO' || result.outcome === 'CANCEL')) {
          console.log(`   ➡️ Triggering payout for ${result.outcome}...`);
          
          const mockReq = { body: { market_id: market.market_id, winning_outcome: result.outcome } };
          const mockRes = { status: () => mockRes, json: (data) => data };
          const resolveData = await resolveMarket(mockReq, mockRes);

          if (resolveData && resolveData.success) {
             console.log(`   ✅ Successfully resolved and paid out!`);
             resolvedCount++;
          } else {
             console.error(`   ❌ Failed to resolve via internal function:`, resolveData?.message);
          }
        } else {
          console.log(`   ⏭️ Skipping market. AI could not confidently resolve it.`);
        }

      } catch (marketErr) {
        console.error(`   ❌ Error resolving market ${market.market_id}:`, marketErr.message);
      }
    }

    console.log(`\n🏁 [Cron] AI Market Resolver finished. Successfully resolved ${resolvedCount}/${expiredMarkets.length} markets.`);

  } catch (error) {
    console.error("❌ [Cron] Error in AI Market Resolver:", error.message);
  }
}

export {  resolveExpiredMarkets  };
