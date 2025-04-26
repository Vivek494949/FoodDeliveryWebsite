import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  console.log("----------------------------------------");
  console.log("Inside order detail API");

  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      console.log("Session not running...");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user from DB based on email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const orderId = id;

    console.log("Order ID: ", orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            imagePath: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!order) {
      console.log("Order not found");
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    console.log("Comparing session user with order user...");
    if (order.user.id !== user.id) {
      console.log(`Forbidden: session user id (${user.id}) does not match order user id (${order.user.id})`);
      return NextResponse.json({ message: "You are not authorized to view this order" }, { status: 403 });
    }

    console.log("All OK, returning order...");
    return NextResponse.json(order);

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
