import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

// localFilePath comes from the file that have been already uploaded in our server(public/images)
// and we are uploading that file in the cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // If localFilePath is an array, map through it and upload each file
    if (Array.isArray(localFilePath)) {
      const uploadPromises = localFilePath.map(async (file) => {
        const response = await cloudinary.uploader.upload(file.localPath, {
          resource_type: "auto",
        });
        fs.unlinkSync(file.localPath);
        return response;
      });
      return Promise.all(uploadPromises);
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log("file is uploaded on cloudinary: ", response.url);
    fs.unlinkSync(localFilePath); //removing the file from the server after it has been successfully uploaded on cloudinary
    return response;
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    // if files uploading is not successfull than delete the file from the server
    if (Array.isArray(localFilePath)) {
      localFilePath.forEach((file) => fs.unlinkSync(file.localPath));
    } else {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
