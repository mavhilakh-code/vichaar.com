import { supabase } from './utils/supabase.js';
import axios from 'axios';import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Ask Gemini a yes/no question and return the answer (YES/NO).
 */
async function getGeminiDecision(prompt, retries = 3) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set – defaulting decision to CANCEL');
    return 'CANCEL';
  }
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.0 }
    });
    const text = response.text?.trim().toUpperCase();
    if (text.includes('YES')) return 'YES';
    if (text.includes('NO')) return 'NO';
    return 'CANCEL';
  } catch (e) {
    if (e.message && e.message.includes('429') && retries > 0) {
       console.log('Gemini 429 Rate Limit Hit. Waiting 60 seconds before retry...');
       await sleep(60000);
       return getGeminiDecision(prompt, retries - 1);
    }
    console.error('Gemini decision error:', e.message);
    return 'CANCEL';
  }
}

/**
 * Fetch actual weather for a city on a given date using the IMD API.
 * The IMD endpoint expects a station ID; for simplicity we use a placeholder mapping.
 */
const IMD_STATION_MAP = {
  Mumbai: '126',
  Delhi: '108',
  Bengaluru: '131',
  Chennai: '118',
  Kolkata: '101',
  Hyderabad: '134',
  Jaipur: '146',
  Ahmedabad: '152',
  Pune: '164',
  Lucknow: '138',
  Guwahati: '173',
  Tezpur: '176',
  Biswanath: '179'
};

async function fetchActualWeather(cityName, date) {
  // IMD API: https://api.imd.gov.in/api/v1/current_wx?id=StationId
  const stationId = IMD_STATION_MAP[cityName];
  if (!stationId) return null;
  try {
    const resp = await axios.get(`https://api.imd.gov.in/api/v1/current_wx?id=${stationId}`);
    const data = resp.data;
    // The API returns current weather; for historic we would need a different endpoint.
    // Here we just return the latest temperature and precipitation as a fallback.
    return {
      max_temp: data?.data?.temp ?? null,
      precip: data?.data?.precip ?? null
    };
  } catch (e) {
    console.error(`Failed IMD fetch for ${cityName}:`, e.message);
    return null;
  }
}

async function determineOutcome(city, targetDate, forecast) {
  // forecast: { max_temp, precip }
  // For each market we have two possible questions: temperature > threshold and rain > threshold.
  // We'll compare the forecasted threshold with actual data (if available).
  const actual = await fetchActualWeather(city.name, targetDate);
  if (!actual) return null; // unable to decide
  const outcomes = {};
  // Temperature outcome: YES if actual max_temp > forecast.thresholdTemp
  const thresholdTemp = Math.floor(forecast.max_temp);
  outcomes.temp = actual.max_temp > thresholdTemp ? 'YES' : 'NO';
  // Rain outcome (if forecast precip > 0.5)
  if (forecast.precip > 0.5) {
    const thresholdRain = Math.floor(forecast.precip);
    outcomes.rain = actual.precip > thresholdRain ? 'YES' : 'NO';
  }
  return outcomes;
}

async function settleExpiredMarkets() {
  console.log('🔧 Starting auto‑settlement of expired weather markets...');
  const { data: markets, error } = await supabase
    .from('markets')
    .select('market_id, question, end_date, status')
    .eq('category', 'Politics') // weather markets are stored under Politics
    .eq('status', 'Active');
  if (error) throw error;

  const now = new Date();
  for (const market of markets) {
    const end = new Date(market.end_date);
    if (end > now) continue; // not expired yet

    // Parse city and forecast thresholds from the question text.
    // Expected formats: "City above X°C on Day?" or "City rain over Ymm on Day?"
    const tempMatch = market.question.match(/^(\w+) above (\d+)°C on/);
    const rainMatch = market.question.match(/^(\w+) rain over (\d+)mm on/);
    let winningOutcome = null;
    if (tempMatch) {
      const cityName = tempMatch[1];
      const threshold = parseInt(tempMatch[2], 10);
      // Resolve market date as YYYY-MM-DD
      const marketDate = new Date(market.end_date).toISOString().split('T')[0];
      // Detailed Gemini prompt with date, region (India) and IMD source citation
      const prompt = `According to the India Meteorological Department (IMD) historical records for ${cityName} on ${marketDate}, was the maximum temperature greater than ${threshold}°C? Respond ONLY with YES or NO.`;
      const geminiOutcome = await getGeminiDecision(prompt);
      winningOutcome = geminiOutcome;
    } else if (rainMatch) {
      const cityName = rainMatch[1];
      const threshold = parseInt(rainMatch[2], 10);
      const marketDate = new Date(market.end_date).toISOString().split('T')[0];
      const prompt = `According to the India Meteorological Department (IMD) historical data for ${cityName} on ${marketDate}, did precipitation exceed ${threshold}mm? Respond ONLY with YES or NO.`;
      const geminiOutcome = await getGeminiDecision(prompt);
      winningOutcome = geminiOutcome;
    } else {
      // Unknown format – skip.
      continue;
    }

    // Resolve the market via backend API
    const resolveRes = await fetch('http://localhost:5000/api/markets/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market_id: market.market_id, winning_outcome: winningOutcome })
    });
    const resolveData = await resolveRes.json();
    if (resolveData.success) {
      console.log(`✅ Settled market ${market.market_id} as ${winningOutcome}`);
    } else {
      console.error(`❌ Failed to settle market ${market.market_id}:`, resolveData.message);
    }
    
    // Add a 4 second delay to avoid hitting Gemini's Free Tier Rate Limit (15 RPM)
    await sleep(4000);
  }
  console.log('🔧 Auto‑settlement run complete.');
}

settleExpiredMarkets().catch(err => {
  console.error('⚠️ Settlement script crashed:', err);
});
