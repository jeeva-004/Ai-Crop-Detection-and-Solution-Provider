import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import predictRoute from "./routes/predict.js";



const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
console.log("Groq Key Loaded:", !!process.env.GROQ_API_KEY);

app.use("/api/predict", predictRoute);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
