import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the form data
    const formData = await request.formData()
    const image = formData.get("image") as File | null

    if (!image) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const folder = `food-express/${session.user.id}`
    const result = await uploadImage(buffer, folder)

    return NextResponse.json({
      url: result.secure_url,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ message: "Error uploading image", error: (error as Error).message }, { status: 500 })
  }
}
