"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShoppingBag, User, Menu, X, ShoppingCart, LogOut, Home, Search, Clock, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HomeNavbarProps {
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export default function HomeNavbar({ user }: HomeNavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/home", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/search", label: "Search", icon: <Search className="h-4 w-4 mr-2" /> },
    { href: "/orders", label: "Orders", icon: <Clock className="h-4 w-4 mr-2" /> },
    { href: "/favorites", label: "Favorites", icon: <Heart className="h-4 w-4 mr-2" /> },
  ];

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isScrolled && "shadow-sm"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/home" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">FoodExpress</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href && "text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Menu & Cart */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders" className="cursor-pointer">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <Link href="/cart" className="mr-2">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
          <button
            className="flex items-center justify-center rounded-md p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "container md:hidden",
          isMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="flex items-center gap-4 py-4 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
          </div>
        </div>
        <nav className="flex flex-col space-y-4 py-4">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href && "text-primary"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <Link 
            href="/profile" 
            className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
          <button
            className="flex items-center text-sm font-medium text-destructive transition-colors hover:text-destructive/80 w-full text-left"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
