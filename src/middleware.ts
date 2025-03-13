import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {

	const session = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
		secureCookie: process.env.NODE_ENV === 'production'
	});

	const publicPaths = ['/', '/loginSystem/login', '/loginSystem/signup', '../public', '/loginSystem/forgot-password', '/loginSystem/reset-password', '/how-it-works','/loginSystem/verify-otp'];

	const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

	// console.log("Current Path:", request.nextUrl.pathname);
	// console.log("Session exists:", !!session);
	
	
	
	// console.log("Is Public Path:", isPublicPath);




	if (!session && !isPublicPath) {
		console.log("Middleware (!session and !public path).... redirecting to login page.....");
		return NextResponse.redirect(new URL('/loginSystem/login', request.url));
	}

	if (session) {
		console.log("\n\nMiddleware (session exists) \n\n");
		// You can add additional checks here if needed
	}

	return NextResponse.next();
}


export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|public|assets|images|.*\\.(?:jpg|jpeg|png|gif|webp)).*)',
	],
};