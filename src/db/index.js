import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Connected Succesfully✅");
  } catch (error) {
    console.error("MongoDb Connection Error❌: ", error);
    process.exit(1);
  }
};

export default connectDB;

//import karo mangoos and phir usse try catch me daal do jisme try ke andar
//  await mongoose.connect(process.env.MONGO_URI ka use karna)

