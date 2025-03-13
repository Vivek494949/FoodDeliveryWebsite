"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevents automatic redirection
      });
  
      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
        return; // Exit early to prevent further execution
      }
  
      toast.success("You have successfully logged in.");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center w-full px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 lg:w-1/2">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold">FoodExpress</span>
            </Link>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block lg:w-1/2">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary to-primary-foreground">
          <div className="flex h-full items-center justify-center p-12 text-white">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold mb-4">Hungry? We've got you covered.</h2>
              <p className="text-lg mb-6">
                Log in to your account to order from your favorite restaurants and enjoy fast, reliable delivery.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Quick Ordering</h3>
                  <p className="text-sm">Order from your favorite restaurants with just a few clicks.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Order History</h3>
                  <p className="text-sm">Easily reorder from your previous orders.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Exclusive Deals</h3>
                  <p className="text-sm">Access special promotions and discounts.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Saved Addresses</h3>
                  <p className="text-sm">Save multiple delivery addresses for convenience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
