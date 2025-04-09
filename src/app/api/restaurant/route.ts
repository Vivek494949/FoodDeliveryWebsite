import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { uploadImage } from "@/lib/cloudinary"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const city = formData.get("city") as string
    const country = formData.get("country") as string
    const deliveryPrice = Number.parseFloat(formData.get("deliveryPrice") as string)
    const estimatedTime = formData.get("estimatedTime") as string
    const cuisines = formData.get("cuisines") as string
    const menuJson = formData.get("menu") as string
    const image = formData.get("image") as File

    // Validate required fields
    if (!name || !city || !country || isNaN(deliveryPrice) || !estimatedTime || !cuisines) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Parse menu items
    const menuItems = JSON.parse(menuJson)

    // Check if user already has a restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
    })

    if (existingRestaurant) {
      return NextResponse.json({ message: "You already have a restaurant" }, { status: 400 })
    }

    // Upload image to Cloudinary if provided
    let imagePath = null
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      imagePath = await uploadImage(buffer)
    }

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: session.user.id,
        name,
        city,
        country,
        deliveryPrice,
        estimatedTime,
        cuisines,
        imagePath,
        menu: {
          create: menuItems.map((item: any) => ({
            name: item.name,
            description: item.description || null,
            price: Number.parseFloat(item.price),
            category: "Main",
          })),
        },
      },
      include: {
        menu: true,
      },
    })

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

