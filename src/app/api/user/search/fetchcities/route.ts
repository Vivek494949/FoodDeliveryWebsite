import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const cities = await prisma.restaurant.findMany({
  select: { city: true },
  distinct: ["city"],
  orderBy: { city: "asc" },
})

    const cityNames = cities.map((c) => c.city).filter(Boolean)
    return NextResponse.json(cityNames)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ message: "Failed to fetch cities" }, { status: 500 })
  }
}
