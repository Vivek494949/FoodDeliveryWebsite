import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil",
})

console.log("🚨 File /api/checkout/route.ts is being loaded")

type OrderItemInput = {
  menuItemId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  console.log("Checkout below this now:")
  try {
    console.log("Checkout below this :")
    console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_API_KEY)

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { restaurantId, items, deliveryDetails, totalAmount }: {
      restaurantId: string
      items: OrderItemInput[]
      deliveryDetails: {
        addressLine1: string
        addressLine2?: string
        city?: string
        country?: string
      }
      totalAmount: number
    } = body
    

    // Validate required fields
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 })
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 })
    }

    // Create a temporary order in the database with 'pending_payment' status
    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        totalAmount,
        status: "pending_payment",
        items: {
          create: await Promise.all(
            items.map(async (item: OrderItemInput) => {
              // Fetch the actual menu item from the database to verify the price
              const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
              })

              if (!menuItem) {
                throw new Error(`Menu item with ID ${item.menuItemId} not found`)
              }

              // Use the price from the database for security
              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuItem.price, // Use price from database
              }
            }),
          ),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
    })

    // Update user address if provided
    if (deliveryDetails && deliveryDetails.addressLine1) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          addressLine1: deliveryDetails.addressLine1,
          addressLine2: deliveryDetails.addressLine2 || null,
          city: deliveryDetails.city || null,
          country: deliveryDetails.country || null,
        },
      })
    }

    // Create line items for Stripe
    const lineItems = order.items.map((item) => {
      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.menuItem.name,
            description: item.menuItem.description || undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents/pennies
        },
        quantity: item.quantity,
      }
    })

    // Add delivery fee as a separate line item
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: "Delivery Fee",
          description: `Delivery from ${restaurant.name}`,
        },
        unit_amount: Math.round(restaurant.deliveryPrice * 100), // Convert to pennies
      },
      quantity: 1,
    })

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: userId,
      },
    })

    return NextResponse.json({
      url: stripeSession.url,
      orderId: order.id,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

