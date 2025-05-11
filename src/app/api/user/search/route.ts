import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const location = searchParams.get("location") || ""

    // Build the search conditions
    const searchConditions = []

    // Search by name or cuisine
    if (query) {
      searchConditions.push({
        OR: [
          { name: { contains: query } },
          { cuisines: { contains: query } },
        ],
      })
    }

    // Filter by location
    if (location) {
      searchConditions.push({
        OR: [
          { city: { contains: location } },
          { country: { contains: location } },
        ],
      })
    }

    // Combine all conditions with AND
    const whereClause = searchConditions.length > 0 ? { AND: searchConditions } : {}

    // Execute the search query
    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        cuisines: true,
        deliveryPrice: true,
        estimatedTime: true,
        imagePath: true,
        rating: true,
        isOpen: true,
      },
      orderBy: {
        rating: "desc",
      },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("Error searching restaurants:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

