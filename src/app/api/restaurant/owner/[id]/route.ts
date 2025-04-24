import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" // Import NextAuth config
import prisma from "@/lib/prisma" // Import Prisma client
import { uploadImage } from "@/lib/cloudinary"

type MenuItemInput = {
  id?: string
  name: string
  price: number
  description?: string
}

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    // Await context.params
    const params = await context.params
    const { id: ownerId } = params // Extract ID after awaiting

    if (!ownerId) {
      return NextResponse.json({ message: "Bad Request: Missing owner ID" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    // console.log("👤 Session User ID:", session?.user?.id);
    // console.log("🏠 Owner ID from params:", ownerId);

    if (!session || !session.user || session.user.id !== ownerId) {
      // console.log("🚫 Unauthorized: User ID mismatch");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // console.log("🔍 Fetching restaurant for owner ID:", ownerId);

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId },
      include: { menu: true },
    })

    if (!restaurant) {
      return NextResponse.json({ message: "Not Found: No restaurant found for this owner" }, { status: 404 })
    }

    return NextResponse.json(restaurant, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  // ✅ Await params before accessing
  const params = await context.params
  const restaurantId = params.id

  console.log("🔍 Received PATCH request for restaurant:", restaurantId)

  try {
    if (!restaurantId) {
      return NextResponse.json({ message: "Bad Request: Missing restaurant ID" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 🔍 Find the restaurant by ID
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true }, // Include menu items
    })

    if (!existingRestaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 })
    }

    // 🔐 Ensure the logged-in user is the owner
    if (existingRestaurant.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // ✅ Process the update
    const formData = await request.formData()
    const name = formData.get("name")?.toString().trim()
    const city = formData.get("city")?.toString().trim()
    const country = formData.get("country")?.toString().trim()
    const deliveryPrice = Number.parseFloat(formData.get("deliveryPrice")?.toString() || "0")
    const estimatedTime = formData.get("estimatedTime")?.toString().trim()
    const cuisinesRaw = formData.get("cuisines")?.toString()
    const cuisines = cuisinesRaw ? cuisinesRaw.split(",").map((c) => c.trim()) : []

    const menuRaw = formData.get("menu")?.toString()
    let menuItems: MenuItemInput[] = []

    try {
      menuItems = menuRaw ? JSON.parse(menuRaw) : []
    } catch (err) {
      console.error("❌ Invalid menu JSON:", err)
      return NextResponse.json({ message: "Invalid menu format" }, { status: 400 })
    }

    if (!name || !city || !country || !estimatedTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const image = formData.get("image") as File | null
    let imagePath: string | undefined = existingRestaurant.imagePath ?? undefined

    if (image) {
      // Convert the file to a buffer
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary
      const folder = `food-express/${session.user.id}`
      const result = await uploadImage(buffer, folder)
      imagePath = result.secure_url
    }

    // 🛠 First, update the restaurant details without touching the menu
     await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        city,
        country,
        deliveryPrice,
        estimatedTime,
        cuisines: cuisines.join(","),
        imagePath,
      },
    })

    // 🛠 Now handle the menu items separately to avoid foreign key constraint issues
    // First, get existing menu item IDs
    const existingMenuItemIds = existingRestaurant.menu.map((item) => item.id)

    // Delete menu items that are no longer in the updated menu
    // This is safer than deleteMany({}) which was causing the foreign key constraint error
    for (const menuItemId of existingMenuItemIds) {
      // Check if this menu item is still in the updated menu
      const stillExists = menuItems.some((item) => item.id === menuItemId)

      if (!stillExists) {
        // Only delete if there are no references in OrderItem
        const orderItemCount = await prisma.orderItem.count({
          where: { menuItemId },
        })

        if (orderItemCount === 0) {
          // Safe to delete
          await prisma.menuItem.delete({
            where: { id: menuItemId },
          })
        } else {
          // Mark as unavailable instead of deleting
          await prisma.menuItem.update({
            where: { id: menuItemId },
            data: { availability: false },
          })
        }
      }
    }

    // Update existing menu items and create new ones
    for (const item of menuItems) {
      if (item.id) {
        // Update existing item
        await prisma.menuItem.update({
          where: { id: item.id },
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            availability: true,
          },
        })
      } else {
        // Create new item
        await prisma.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            restaurantId,
          },
        })
      }
    }

    // Fetch the updated restaurant with menu items
    const refreshedRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true },
    })

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant: refreshedRestaurant,
    })
  } catch (error) {
    console.error("❌ Error updating restaurant:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 })
  }
}
