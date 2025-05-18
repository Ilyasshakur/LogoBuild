import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginCredentials, loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/common/Logo";

export default function Login() {
  const [location, navigate] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  // Get redirect URL from query parameter
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('redirect') || '/account';
  };
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectUrl());
    }
  }, [isAuthenticated]);
  
  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      navigate(getRedirectUrl());
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled in the login function
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Sign In - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
              <h1 className="text-2xl font-heading font-bold">Sign In to UshopLS</h1>
              <p className="text-neutral-600 mt-1">
                Enter your credentials to access your account
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              type="email"
                              {...field}
                            />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-4 text-center">
                  <Link href="/forgot-password">
                    <a className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </a>
                  </Link>
                </div>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-neutral-500">
                      OR
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-neutral-600">
                    Don't have an account?{" "}
                    <Link href={`/register${location.includes('?') ? location.substring(location.indexOf('?')) : ''}`}>
                      <a className="text-primary font-medium hover:underline">
                        Sign Up
                      </a>
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
