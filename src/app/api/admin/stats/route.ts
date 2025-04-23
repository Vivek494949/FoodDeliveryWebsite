import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"; 
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // console.log("Session: in route.ts of stats", session); // ✅ Debugging

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const totalUsers = await prisma.user.count()
    const totalRestaurants = await prisma.restaurant.count()
    const totalOrders = await prisma.order.count()
    const averageRating = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    })

    return NextResponse.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      averageRating: averageRating._avg.rating || 0,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

