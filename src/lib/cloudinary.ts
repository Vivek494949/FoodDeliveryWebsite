import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads an image to Cloudinary
 * @param file The file buffer to upload
 * @param folder The folder to upload to (optional)
 * @returns The Cloudinary upload response
 */
export async function uploadImage(file: Buffer, folder = "food-express") {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Failed to upload image"))
          }
          resolve({ secure_url: result.secure_url })
        },
      )
      .end(file)
  })
}
