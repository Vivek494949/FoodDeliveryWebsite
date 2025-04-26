import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import NextAuth config
import prisma from "@/lib/prisma"; // Import Prisma client
import { uploadImage } from "@/lib/cloudinary";

export async function GET(request, context) {
  try {
    const { id: ownerId } = context.params;

    if (!ownerId) {
      return NextResponse.json({ message: "Bad Request: Missing owner ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.id !== ownerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId },
      include: { menu: true },
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Not Found: No restaurant found for this owner" }, { status: 404 });
    }

    return NextResponse.json(restaurant, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const { id: restaurantId } = context.params;

  console.log("🔍 Received PATCH request for restaurant:", restaurantId);

  try {
    if (!restaurantId) {
      return NextResponse.json({ message: "Bad Request: Missing restaurant ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true },
    });

    if (!existingRestaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    if (existingRestaurant.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const country = formData.get("country")?.toString().trim();
    const deliveryPrice = Number.parseFloat(formData.get("deliveryPrice")?.toString() || "0");
    const estimatedTime = formData.get("estimatedTime")?.toString().trim();
    const cuisinesRaw = formData.get("cuisines")?.toString();
    const cuisines = cuisinesRaw ? cuisinesRaw.split(",").map((c) => c.trim()) : [];

    const menuRaw = formData.get("menu")?.toString();
    let menuItems = [];

    try {
      menuItems = menuRaw ? JSON.parse(menuRaw) : [];
    } catch (err) {
      console.error("❌ Invalid menu JSON:", err);
      return NextResponse.json({ message: "Invalid menu format" }, { status: 400 });
    }

    if (!name || !city || !country || !estimatedTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const image = formData.get("image");
    let imagePath = existingRestaurant.imagePath ?? undefined;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const folder = `food-express/${session.user.id}`;
      const result = await uploadImage(buffer, folder);
      imagePath = result.secure_url;
    }

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
    });

    const existingMenuItemIds = existingRestaurant.menu.map((item) => item.id);

    for (const menuItemId of existingMenuItemIds) {
      const stillExists = menuItems.some((item) => item.id === menuItemId);

      if (!stillExists) {
        const orderItemCount = await prisma.orderItem.count({
          where: { menuItemId },
        });

        if (orderItemCount === 0) {
          await prisma.menuItem.delete({
            where: { id: menuItemId },
          });
        } else {
          await prisma.menuItem.update({
            where: { id: menuItemId },
            data: { availability: false },
          });
        }
      }
    }

    for (const item of menuItems) {
      if (item.id) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            availability: true,
          },
        });
      } else {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            restaurantId,
          },
        });
      }
    }

    const refreshedRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true },
    });

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant: refreshedRestaurant,
    });
  } catch (error) {
    console.error("❌ Error updating restaurant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
