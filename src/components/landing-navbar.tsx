"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">FoodExpress</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium transition-colors hover:text-primary">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
            How It Works
          </Link>
          <Link href="/#restaurants" className="text-sm font-medium transition-colors hover:text-primary">
            Restaurants
          </Link>
          <Link href="/#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
            Testimonials
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/loginSystem/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/loginSystem/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn("container md:hidden", isMenuOpen ? "block" : "hidden")}>
        <nav className="flex flex-col space-y-4 py-4">
          <Link
            href="/#features"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/#restaurants"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Restaurants
          </Link>
          <Link
            href="/#testimonials"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Testimonials
          </Link>
          <div className="flex flex-col space-y-2 pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Sign up</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

