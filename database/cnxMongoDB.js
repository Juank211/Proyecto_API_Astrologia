import mongoose from "mongoose";

import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/astroportal";
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado exitosamente (${uri.includes('@') ? 'MongoDB Atlas' : 'MongoDB Local'})`);
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error.message);
  }
};

export { connectDB };
