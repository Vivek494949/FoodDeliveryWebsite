"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search, User, LogOut, ShoppingCart, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ firstName: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/loginSystem/login");
    }

    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router, session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    // Redirect to search page with the search query
     router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=London`)
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">FoodExpress</span>
            </Link>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center gap-4">
            {/* Admin Dashboard button - only shown if user is admin */}
            {session?.user?.role === "admin" && (
  <Button variant="outline" onClick={() => router.push("/admin")}>
    Admin Dashboard
  </Button>
)}
            
            {/* My Restaurant button */}
            <Button variant="outline" onClick={() => router.push("/my-restaurant")}>
              My Restaurant
            </Button>
            
            {/* User profile dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                      <Image 
                        src="/images/avatar.png" 
                        alt="User avatar" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium hidden sm:inline-block">
                      {session?.user?.name || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Info</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            Welcome {userData?.firstName || session?.user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-xl text-muted-foreground">
            What would you like to order today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for restaurants or food..."
                className="w-full rounded-lg border border-input bg-background px-10 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </div>

        {/* Content area - can be populated with restaurants, categories, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* This is a placeholder for future content */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div 
              key={item} 
              className="border rounded-lg p-6 hover:border-primary transition-colors duration-300 hover:shadow-md"
            >
              <div className="h-40 bg-muted rounded-md mb-4 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">Restaurant {item}</h3>
              <p className="text-muted-foreground text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
