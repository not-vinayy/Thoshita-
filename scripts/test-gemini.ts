/**
 * Test script to verify Gemini API key is working
 * Run with: npx tsx scripts/test-gemini.ts
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";



async function testGeminiAPI() {
    console.log("🔍 Testing Gemini API connection...\n");

    // Check if API key exists
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is not set");
        console.error("   Make sure it's in your .env file and you're running with:");
        console.error("   npx dotenv -e .env -- npx tsx scripts/test-gemini.ts");
        console.error("\n   Or set it inline:");
        console.error("   GOOGLE_GENERATIVE_AI_API_KEY=your_key npx tsx scripts/test-gemini.ts");
        process.exit(1);
    }
    console.log("✅ API key found in environment variables");

    try {
        console.log("📡 Sending test request to Gemini API...\n");

        const { text } = await generateText({
            model: google("gemini-2.0-flash"),
            prompt: "Say 'Hello! The Gemini API is working correctly.' and nothing else.",
        });

        console.log("✅ Gemini API Response:");
        console.log("─".repeat(40));
        console.log(text);
        console.log("─".repeat(40));
        console.log("\n🎉 Success! Your Gemini API key is working correctly.");
    } catch (error: any) {
        console.error("\n❌ Error connecting to Gemini API:");
        console.error("─".repeat(40));
        console.error(error.message || error);
        console.error("─".repeat(40));
        console.error("\nPossible issues:");
        console.error("  1. Invalid API key");
        console.error("  2. API key doesn't have access to the Gemini model");
        console.error("  3. Network connectivity issues");
        console.error("  4. Rate limiting");
        process.exit(1);
    }
}

testGeminiAPI();
