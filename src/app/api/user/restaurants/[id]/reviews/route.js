import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: restaurantId } = context.params;
    const userId = session.user.id;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        restaurantId,
      },
    });

    if (existingReview) {
      return NextResponse.json({ message: "You have already reviewed this restaurant" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        restaurantId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { restaurantId },
      select: { rating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { rating: averageRating },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
