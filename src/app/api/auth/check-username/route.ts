// // to check if the username already exist or not, on signup page

// import { type NextRequest, NextResponse } from "next/server"
// import prisma from '../../../../lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const { username } = await request.json()

//     if (!username) {
//       return NextResponse.json({ error: "Username is required" }, { status: 400 })
//     }

//     // Check if username already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { username },
//       select: { id: true },
//     })

//     return NextResponse.json({
//       available: !existingUser,
//     })
//   } catch (error) {
//     console.error("Error checking username:", error)
//     return NextResponse.json({ error: "An error occurred while checking username" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
// import { Buffer } from "buffer";

// Allow only safe usernames
// Contain only letters (A-Z, a-z), numbers (0-9), underscores (_) and hyphens (-)
// Are between 3 to 20 characters
// Do not contain spaces, special characters like !@#$%^&*()+=, or dangerous characters (\0\x08\x09\x1a\n\r"'\\%)
function isValidUsername(username: string): boolean {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/; // Restrict to alphanumeric, _, -
  return regex.test(username) && !/[\0\x08\x09\x1a\n\r"'\\%]/.test(username);
}

export async function POST(request: NextRequest) {
  

  try {
    const { username } = await request.json();

    if (!username || !isValidUsername(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Store username temporarily in a buffer
    const tempUsername = username.trim();

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: tempUsername.toString() },
      select: { id: true },
    });

    // Securely destroy temporary buffer
    tempUsername.fill(0);

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json({ error: "An error occurred while checking username" }, { status: 500 });
  }
}
