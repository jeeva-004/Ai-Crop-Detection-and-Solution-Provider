import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getTreatment(disease, language) {
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Explain treatment for ${disease} in simple ${language} for farmers`;

const result = await model.generateContent(prompt);
return result.response.text();
}
