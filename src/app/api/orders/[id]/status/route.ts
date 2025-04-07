import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["pending_payment", "paid", "preparing", "out_for_delivery", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 })
    }

    // Get the order to check if the user is authorized to update it
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check if the user is the restaurant owner
    if (order.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to update this order" }, { status: 403 })
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

