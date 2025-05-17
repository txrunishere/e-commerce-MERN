import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoDBConnectionInstence = await mongoose.connect(
      process.env.MONGODB_URL
    );
    console.log(
      "MongoDB connect Successful!!",
      mongoDBConnectionInstence.connection.host,
      mongoDBConnectionInstence.connection.name
    );
  } catch (error) {
    console.log("Error while connect to mongoose", error);
    process.exit(1)
  }
};
