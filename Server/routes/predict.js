import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import Prediction from "../models/Prediction.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { language } = req.body;
    const imagePath = req.file.path;

    // 1️⃣ Crop Disease Detection (Hugging Face)
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/nateraw/plant-disease",
      fs.readFileSync(imagePath),
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    const disease = hfResponse.data[0].label;
    const confidence = hfResponse.data[0].score;

    // 2️⃣ AI Treatment Explanation (Gemini)
    const prompt = `Explain treatment for ${disease} in simple ${language} for farmers`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const treatment =
      geminiResponse.data.candidates[0].content.parts[0].text;

    // 3️⃣ Save to DB
    await Prediction.create({
      disease,
      confidence,
      language,
      treatment
    });

    fs.unlinkSync(imagePath); // cleanup

    res.json({ disease, confidence, treatment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Prediction failed" });
  }
});

export default router;
