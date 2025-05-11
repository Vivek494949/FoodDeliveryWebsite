import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Fetch restaurants with pagination
    const restaurants = await prisma.restaurant.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        cuisines: true,
        imagePath: true,
        rating: true,
        estimatedTime: true,
        deliveryPrice: true,
      },
    })

    // Get total count for pagination
    const totalCount = await prisma.restaurant.count({
      where: { isOpen: true },
    })

    return NextResponse.json({
      restaurants,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

