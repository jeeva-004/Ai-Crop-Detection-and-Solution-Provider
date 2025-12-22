import { createGroqClient } from "../utilis/groq.js";

export async function getTreatment(disease, language) {
  const groq = createGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // ✅ UPDATED
    messages: [
      {
        role: "system",
        content: "You are an agricultural expert who advises farmers."
      },
      {
        role: "user",
        content: `
Crop disease: ${disease}
Language: ${language}
Explain in simple farmer-friendly words:
1. Cause
2. Symptoms
3. Treatment
4. Prevention
`
      }
    ],
    temperature: 0.6,
    max_tokens: 3000
  });

  return completion.choices[0].message.content;
}
// Language: ${language}
// if the crop is healthy one, only give a suggessions how to prevent it from disease.
// Explain in simple farmer-friendly words:
// 1. Cause
// 2. Symptoms
// 3. Treatment
// 4. Prevention