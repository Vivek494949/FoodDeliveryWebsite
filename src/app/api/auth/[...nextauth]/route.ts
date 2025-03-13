import { z } from "zod";
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

const loginSchema = z.object({
	email: z.string().email().max(40, "Email cannot exceed 40 characters"),
	password: z.string().min(8).max(30, "Password cannot exceed 30 characters")
});

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {

				const parsed = loginSchema.safeParse(credentials);

				if (!parsed.success) {
					console.log(parsed.error.errors[0].message);
					
					throw new Error(parsed.error.errors[0].message); // Return validation error message
				}
				const { email, password } = parsed.data;
				const normalizedEmail = email.toLowerCase(); // Normalize email
		
				// Fetch user from database
				const user = await prisma.user.findUnique({
				  where: { email: normalizedEmail },
				});
		
				if (!user) {
				  throw new Error("User not found");
				}
		
				// Validate password
				const isPasswordValid = await bcrypt.compare(password, user.password);
				if (!isPasswordValid) {
				  throw new Error("Incorrect password");
				}

				return {
					id: user.id.toString(),
					email: user.email,
					name: user.username,
					role: user.role

				}
			}
		})
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.role = user.role

			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as string

			}
			return session
		},
	},
	pages: {
		signIn: '/loginSystem/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }