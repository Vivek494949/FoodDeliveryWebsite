import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: Buffer): Promise<string> {
  try {
    // Convert the buffer to a base64 string
    const base64Data = `data:image/jpeg;base64,${file.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "food-delivery",
      resource_type: "image",
    })

    // Return the secure URL
    return result.secure_url
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

