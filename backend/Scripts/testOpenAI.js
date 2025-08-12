import OpenAI from "openai";
import dotenv from 'dotenv'

dotenv.config()

async function testOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Make sure your .env file has this key set
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" },
      ],
    });

    console.log("OpenAI response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI test error:", error);
  }
}

testOpenAI();
