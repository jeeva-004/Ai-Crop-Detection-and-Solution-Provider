import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema({
  disease: String,
  confidence: Number,
  language: String,
  treatment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Prediction", PredictionSchema);