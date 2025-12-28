require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // There isn't a direct listModels on genAI instance in some versions, 
        // but usually it's on the model or via a separate manager. 
        // Actually, for the JS SDK, it might not be directly exposed easily in the main class 
        // without using the underlying admin API.
        // However, let's try a direct simple generation with a typically safe model to see if it works at all.
        // If we want to LIST, we probably need a different endpoint, or we just try a few known ones.

        // Let's try to just hit the API with a raw fetch to list models if the SDK doesn't help.
        // The SDK documentation says... actually it doesn't always expose listModels in the client SDK.

        console.log("Checking API Key: ", process.env.GEMINI_API_KEY ? "Present" : "Missing");

        const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of modelsToTry) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} responded: ${response.text()}`);
            } catch (error) {
                console.log(`FAILED: ${modelName} - ${error.message}`);
            }
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
