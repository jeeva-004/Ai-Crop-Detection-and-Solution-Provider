import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import Prediction from "../models/Prediction.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTreatment } from "../utilis/gemini.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { language = "English" } = req.body;

    // ✅ Send image to ML service
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );

    const { disease, confidence } = mlResponse.data;


    let treatment = "Treatment advice not available";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
      const result = await model.getTreatment(disease, language);
      treatment = result.response.text();
    } catch (err) {
      console.error("Gemini error:", err.message);
    }

    await Prediction.create({
      disease,
      confidence,
      language,
      treatment,
    });

    return res.json({ disease, confidence, treatment });

  } catch (error) {
    console.error("🔥 ERROR:", error.message);
    return res.status(500).json({
      error: "Prediction failed",
      details: error.message,
    });
  }
});

export default router;