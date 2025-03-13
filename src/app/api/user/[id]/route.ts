import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();
    const session = await getServerSession(authOptions);

    // console.log("Session:", session); // ✅ Log session again to verify fix
    // console.log("Requested userId:", userId);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== userId) {
      console.log("Forbidden access: session user does not match requested user.");
      return NextResponse.json({ message: "Forbidden: Access denied" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        profileImage: true,
        role: true,
        location: true,
        country: true, // ✅ Add country
        city: true, // ✅ Add city
        addressLine1: true, // ✅ Add address line 1
        addressLine2: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}