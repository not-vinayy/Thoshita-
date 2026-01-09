import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU' }, { status: 200 });
}

export async function POST(request: Request) {
    const timestamp = () => new Date().toISOString();

    console.log("\n" + "=".repeat(80));
    console.log(`[${timestamp()}] 🚀 POST /api/vapi/generate - Request received`);
    console.log("=".repeat(80));

    let rawBody: string = "";
    let parsedBody: any;

    try {
        // Log raw request details
        console.log(`\n[${timestamp()}] 📥 REQUEST DETAILS:`);
        console.log(`  - Method: ${request.method}`);
        console.log(`  - URL: ${request.url}`);
        console.log(`  - Headers:`);
        request.headers.forEach((value, key) => {
            console.log(`      ${key}: ${value}`);
        });

        // Parse and log the request body
        rawBody = await request.text();
        console.log(`\n[${timestamp()}] 📦 RAW REQUEST BODY:`);
        console.log(rawBody);

        parsedBody = JSON.parse(rawBody);
        console.log(`\n[${timestamp()}] 📋 PARSED REQUEST BODY:`);
        console.log(JSON.stringify(parsedBody, null, 2));

    } catch (parseError: any) {
        console.error(`\n[${timestamp()}] ❌ ERROR PARSING REQUEST BODY:`);
        console.error(`  - Error: ${parseError.message}`);
        console.error(`  - Raw body was: ${rawBody}`);
        return Response.json({ success: false, error: "Failed to parse request body" }, { status: 400 });
    }

    const { type, role, level, techstack, amount, userid } = parsedBody;

    console.log(`\n[${timestamp()}] 📊 EXTRACTED PARAMETERS:`);
    console.log(`  - type: ${type}`);
    console.log(`  - role: ${role}`);
    console.log(`  - level: ${level}`);
    console.log(`  - techstack: ${techstack}`);
    console.log(`  - amount: ${amount}`);
    console.log(`  - userid: ${userid}`);

    // Check for missing parameters
    const missingParams = [];
    if (!type) missingParams.push("type");
    if (!role) missingParams.push("role");
    if (!level) missingParams.push("level");
    if (!techstack) missingParams.push("techstack");
    if (!amount) missingParams.push("amount");
    if (!userid) missingParams.push("userid");

    if (missingParams.length > 0) {
        console.warn(`\n[${timestamp()}] ⚠️ MISSING PARAMETERS: ${missingParams.join(", ")}`);
    }

    try {
        // Log Gemini API call details
        const prompt = `Prepare questions for a job interview.
            The job role is ${role}.
                The job experience level is ${level}.
                The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
            The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
            Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]

        Thank you! <3
            `;

        console.log(`\n[${timestamp()}] 🤖 GEMINI API CALL:`);
        console.log(`  - Model: gemini-2.0-flash-001`);
        console.log(`  - API Key present: ${!!process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
        console.log(`  - API Key (first 10 chars): ${process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10)}...`);
        console.log(`\n[${timestamp()}] 📝 PROMPT BEING SENT:`);
        console.log("-".repeat(40));
        console.log(prompt);
        console.log("-".repeat(40));

        console.log(`\n[${timestamp()}] ⏳ Calling Gemini API...`);
        const startTime = Date.now();

        const { text: questions, usage, finishReason } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: prompt,
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`\n[${timestamp()}] ✅ GEMINI API RESPONSE RECEIVED:`);
        console.log(`  - Duration: ${duration}ms`);
        console.log(`  - Finish Reason: ${finishReason}`);
        console.log(`  - Usage: ${JSON.stringify(usage)}`);
        console.log(`\n[${timestamp()}] 📄 RAW RESPONSE TEXT:`);
        console.log("-".repeat(40));
        console.log(questions);
        console.log("-".repeat(40));

        // Parse the questions
        console.log(`\n[${timestamp()}] 🔄 PARSING QUESTIONS JSON...`);
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(questions);
            console.log(`  - ✅ Successfully parsed ${parsedQuestions.length} questions`);
            console.log(`  - Questions: ${JSON.stringify(parsedQuestions, null, 2)}`);
        } catch (jsonError: any) {
            console.error(`  - ❌ Failed to parse questions as JSON`);
            console.error(`  - Error: ${jsonError.message}`);
            console.error(`  - Raw text was: ${questions}`);
            throw new Error(`Failed to parse Gemini response as JSON: ${jsonError.message}`);
        }

        // Build interview object
        const interview = {
            role,
            type,
            level,
            techstack: techstack.split(','),
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        console.log(`\n[${timestamp()}] 📦 INTERVIEW OBJECT TO SAVE:`);
        console.log(JSON.stringify(interview, null, 2));

        // Save to Firebase
        console.log(`\n[${timestamp()}] 💾 SAVING TO FIREBASE...`);
        console.log(`  - Collection: interviews`);
        console.log(`  - Firebase DB initialized: ${!!db}`);

        const docRef = await db.collection("interviews").add(interview);

        console.log(`\n[${timestamp()}] ✅ SAVED TO FIREBASE:`);
        console.log(`  - Document ID: ${docRef.id}`);
        console.log(`  - Path: interviews/${docRef.id}`);

        console.log(`\n[${timestamp()}] 🎉 SUCCESS - Returning 200 response`);
        console.log("=".repeat(80) + "\n");

        return Response.json({ success: true, interviewId: docRef.id }, { status: 200 });

    } catch (error: any) {
        console.error(`\n[${timestamp()}] ❌ ERROR OCCURRED:`);
        console.error(`  - Error Name: ${error.name}`);
        console.error(`  - Error Message: ${error.message}`);
        console.error(`  - Error Stack:`);
        console.error(error.stack);

        if (error.cause) {
            console.error(`  - Error Cause: ${JSON.stringify(error.cause, null, 2)}`);
        }

        console.error(`\n[${timestamp()}] 💥 FAILURE - Returning 500 response`);
        console.error("=".repeat(80) + "\n");

        return Response.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}