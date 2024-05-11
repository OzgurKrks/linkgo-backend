import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB'ye bağlandı");
  } catch (error) {
    console.error("MongoDB'ye bağlanırken hata oluştu:", error);
    throw error;
  }
}

export default connectDB;
