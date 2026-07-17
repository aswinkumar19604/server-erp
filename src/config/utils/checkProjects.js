import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/Project.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/erp";

const run = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB at:", mongoUrl);
    
    const projects = await Project.find();
    console.log("----------------------------------------------------------------");
    console.log("📦 CURRENT PROJECTS & TASKS IN DATABASE:");
    console.log(JSON.stringify(projects, null, 2));
    console.log("----------------------------------------------------------------");
    
    process.exit(0);
  } catch (err) {
    console.error("Database check failed:", err);
    process.exit(1);
  }
};

run();
