import axios from 'axios';

async function testIMD() {
    try {
        const response = await axios.get('https://api.imd.gov.in/api/v1/current_wx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        console.log("Status:", response.status);
        console.log("Data sample:", JSON.stringify(response.data).substring(0, 500));
        
        if (Array.isArray(response.data)) {
            console.log("Total stations:", response.data.length);
            console.log("First station:", response.data[0]);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testIMD();
