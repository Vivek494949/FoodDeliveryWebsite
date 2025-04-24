import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
      
        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            isVerified: true,
            role: true,  // ✅ Fetch role instead of isAdmin
            profileImage: true,
            password: true,  // Required for password comparison
          },
        });
      
        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials");
        }
      
        // Remove password before returning user object
        const { password: _password, ...userWithoutPassword } = user;
      
        return {
          ...userWithoutPassword,
          id: user.id,
          email: user.email,
          name: user.username, // ✅ Include name
          role: user.role,
          isAdmin: user.role === "admin",  // ✅ Derive isAdmin dynamically
        };
      }
      ,
    }),
  ],
  pages: {
    signIn: "/loginSystem/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // ✅ Add user ID to token
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id; // ✅ Add user ID to session
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
