"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { SessionProvider, useSession } from "next-auth/react";
import { Toaster } from "sonner";
import "./globals.css";
import LandingNavbar from "@/components/landing-navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthLayout>{children}</AuthLayout>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

// Separate component to check authentication
function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <>
      {!session && <LandingNavbar />} {/* Only show navbar if NOT logged in */}
      {children}
    </>
  );
}
