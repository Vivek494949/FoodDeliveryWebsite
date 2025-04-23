import Link from "next/link";
import { ArrowRight, Utensils, Clock, MapPin, Star, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
// import LandingNavbar from "@/components/landing-navbar";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {/* <LandingNavbar /> */}
      
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-4 mx-auto max-w-[600px] text-center lg:text-left animate-fadeIn">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Delicious Food Delivered to Your Door
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Order from your favorite restaurants and enjoy a seamless delivery experience. Fast, reliable, and always delicious.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                <Link href="/loginSystem/signup">
                  <Button size="lg" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/loginSystem/login">
                  <Button size="lg" variant="outline" className="w-full transition-all duration-300 hover:bg-secondary hover:scale-105">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center animate-slideInRight">
              <img
                alt="Food Delivery"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02]"
                src="/placeholder.svg?height=550&width=750"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="features">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px] mx-auto">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground transition-transform hover:scale-105 duration-300">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose FoodExpress?</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We make food delivery simple, convenient, and enjoyable.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            {[
              {
                icon: <Utensils className="h-6 w-6" />,
                title: "Wide Selection",
                description: "Choose from thousands of restaurants with a variety of cuisines."
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Fast Delivery",
                description: "Get your food delivered quickly with our efficient delivery network."
              },
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "Real-time Tracking",
                description: "Track your order in real-time from the restaurant to your doorstep."
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center space-y-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:bg-background hover:scale-105"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="rounded-full bg-primary p-3 text-primary-foreground transition-transform duration-300 hover:rotate-12">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32" id="how-it-works">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px] mx-auto">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground transition-transform hover:scale-105 duration-300">
                Process
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Getting your favorite food delivered is as easy as 1-2-3.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            {[
              {
                step: 1,
                title: "Browse Restaurants",
                description: "Explore restaurants and menus to find exactly what you're craving."
              },
              {
                step: 2,
                title: "Place Your Order",
                description: "Select your items, customize as needed, and place your order with a few taps."
              },
              {
                step: 3,
                title: "Enjoy Your Food",
                description: "Track your delivery in real-time and enjoy your meal when it arrives."
              }
            ].map((step, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 transition-all duration-300 hover:shadow-lg hover:border-primary hover:scale-105"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground transition-transform duration-300 hover:scale-110">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-center text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="restaurants">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px] mx-auto">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground transition-transform hover:scale-105 duration-300">
                Restaurants
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Popular Restaurants</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover top-rated restaurants in your area.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-lg border bg-background transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
                style={{ animationDelay: `${(i % 3) * 150}ms` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=300&width=400&text=Restaurant+${i}`}
                    alt={`Restaurant ${i}`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold group-hover:text-primary transition-colors duration-300">Restaurant Name {i}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-primary text-primary transition-transform duration-300 group-hover:scale-125" />
                      <span className="ml-1 text-sm">{(4 + i % 1).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Cuisine Type • 20-30 min</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/loginSystem/signup">
              <Button size="lg" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Explore All Restaurants
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32" id="testimonials">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px] mx-auto">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground transition-transform hover:scale-105 duration-300">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Customers Say</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Don't just take our word for it. Here's what our satisfied customers have to say.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                text: "FoodExpress has been a game-changer for me. The variety of restaurants and the quick delivery times make it my go-to food delivery app."
              },
              {
                name: "Michael Chen",
                text: "I love how easy it is to track my order in real-time. The food always arrives hot and fresh, just as if I were dining in the restaurant."
              },
              {
                name: "Emily Rodriguez",
                text: "The customer service is exceptional. When I had an issue with my order, they resolved it immediately and even offered a discount on my next purchase."
              }
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className="flex flex-col justify-between space-y-4 rounded-lg border p-6 bg-background transition-all duration-300 hover:shadow-lg hover:border-primary hover:scale-105"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted h-12 w-12 overflow-hidden transition-transform duration-300 hover:scale-110">
                    <img 
                      src={`/placeholder.svg?height=100&width=100&text=${testimonial.name.charAt(0)}`} 
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">Satisfied Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-[800px] mx-auto">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl animate-pulse">Ready to Order?</h2>
              <p className="text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up now and get your first delivery fee waived.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/loginSystem/signup">
                <Button size="lg" variant="secondary" className="transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 md:py-12 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <ShoppingBag className="h-6 w-6 text-primary transition-transform duration-300 hover:scale-125" />
                <span className="font-bold">FoodExpress</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Delicious food delivered to your door. Fast, reliable, and always fresh.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Partner with Us</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">FAQs</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FoodExpress. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
