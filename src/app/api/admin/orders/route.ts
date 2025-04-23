import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

