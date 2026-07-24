import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function listModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        console.log("Available models:");
        response.data.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.error("List failed:", e.response ? e.response.data : e.message);
    }
}
listModels();
