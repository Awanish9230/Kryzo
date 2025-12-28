const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

        const models = response.data.models;
        if (models) {
            console.log("--- AVAILABLE GEMINI MODELS ---");
            models.forEach(m => {
                if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(m.name);
                }
            });
            console.log("-------------------------------");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
