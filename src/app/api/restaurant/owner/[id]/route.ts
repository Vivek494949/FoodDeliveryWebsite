import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import NextAuth config
import prisma from "@/lib/prisma"; // Import Prisma client
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await context.params
    const params = await context.params;
    const { id: ownerId } = params; // Extract ID after awaiting

    if (!ownerId) {
      return NextResponse.json(
        { message: "Bad Request: Missing owner ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    // console.log("👤 Session User ID:", session?.user?.id);
    // console.log("🏠 Owner ID from params:", ownerId);

    if (!session || !session.user || session.user.id !== ownerId) {
      // console.log("🚫 Unauthorized: User ID mismatch");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // console.log("🔍 Fetching restaurant for owner ID:", ownerId);

    let restaurant = await prisma.restaurant.findUnique({
      where: { ownerId },
      include: { menu: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Not Found: No restaurant found for this owner" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  // ✅ Await params before accessing
  const params = await context.params; 
  const restaurantId = params.id; 

  console.log("🔍 Received PATCH request for restaurant:", restaurantId);

  try {
    if (!restaurantId) {
      return NextResponse.json(
        { message: "Bad Request: Missing restaurant ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔍 Find the restaurant by ID
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // 🔐 Ensure the logged-in user is the owner
    if (existingRestaurant.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ Process the update
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const country = formData.get("country")?.toString().trim();
    const deliveryPrice = parseFloat(formData.get("deliveryPrice")?.toString() || "0");
    const estimatedTime = formData.get("estimatedTime")?.toString().trim();
    const cuisinesRaw = formData.get("cuisines")?.toString();
    const cuisines = cuisinesRaw ? cuisinesRaw.split(",").map((c) => c.trim()) : [];

    const menuRaw = formData.get("menu")?.toString();
    let menuItems: { name: string; price: number; description?: string }[] = [];
    try {
      menuItems = menuRaw ? JSON.parse(menuRaw) : [];
    } catch (err) {
      return NextResponse.json({ message: "Invalid menu format" }, { status: 400 });
    }

    if (!name || !city || !country || !estimatedTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const image = formData.get("image") as File | null;
    let imagePath: string | undefined = existingRestaurant.imagePath ?? undefined;

    if (image) {
      imagePath = await handleImageUpload(image, existingRestaurant.ownerId);
    }

    // 🛠 Update restaurant details
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        city,
        country,
        deliveryPrice,
        estimatedTime,
        cuisines: cuisines.join(","),
        imagePath,
        menu: {
          deleteMany: {}, // Remove existing menu items
          create: menuItems.map((item) => ({
            name: item.name,
            price: item.price,
            description: item.description || null,
          })),
        },
      },
      include: { menu: true },
    });

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("❌ Error updating restaurant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}




async function handleImageUpload(image: File, ownerId: string): Promise<string> {
  // Implement image upload logic here
  // For example, save the image to a specific directory and return the path
  return `/images/${ownerId}/restaurant/restaurantprofileimg.png`;
}
