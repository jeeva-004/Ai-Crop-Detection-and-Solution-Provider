import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import Prediction from "../models/Prediction.js";
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
        timeout: 60000,
      }
    );

    const { disease, confidence } = mlResponse.data;

    let treatment = "Treatment advice not available";

    try {
      treatment = await getTreatment(disease, language);
    } catch (err) {
      console.error("AI Error:", err.message);
      return res.status(500).json({ error: "AI service failed" }); // ✅ RETURN ADDED
    }

    await Prediction.create({
      disease,
      confidence,
      language,
      treatment,
    });

    return res.json({ disease, confidence, treatment }); // ✅ single response

  }  catch (err) {
  console.error("ML Service Error:", err.message);
  return res.status(503).json({
    error: "ML service timeout or unavailable"
  });
}
});

export default router;
