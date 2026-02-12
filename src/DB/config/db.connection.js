import mongoose from "mongoose";
import { DB_URI } from "../../../config/config.service.js";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("DB connected Succefully");
  } catch (error) {
    console.log("DB connected failed" + error);
    console.log(DB_URI);
  }
};

export default connectDB;
