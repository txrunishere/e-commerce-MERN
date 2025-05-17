import dotenv from 'dotenv'
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function uploadOnCloudinary(
  localFile,
  folder = process.env.DEFAULT_CLOUDINARY_FOLDER
) {
  try {
    const responseFileOnCloudinary = await cloudinary.uploader.upload(
      localFile,
      {
        resource_type: "auto",
        folder: folder,
      }
    );
    fs.unlinkSync(localFile);
    return responseFileOnCloudinary;
  } catch (error) {
    fs.unlinkSync(localFile);
    return null;
  }
}


async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.log("Error while deleting from cloudinary", error);
    return null;
  }
}


export {
  uploadOnCloudinary,
  deleteFromCloudinary
}