import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import predictRoute from "./routes/predict.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/predict", predictRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
