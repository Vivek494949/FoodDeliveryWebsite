import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_API_KEY!)

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const sig = request.headers.get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret!)
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error")
    console.error(`Webhook Error: ${error.message}`)
    return NextResponse.json({ message: `Webhook Error: ${error.message}` }, { status: 400 })
  }
  

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Retrieve the order ID from metadata
    const orderId = session.metadata?.orderId

    if (orderId) {
      try {
        // Update the order status to 'paid'
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid" },
        })

        console.log(`Order ${orderId} has been marked as paid`)
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error)
      }
    }
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

