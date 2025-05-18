import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterCredentials, registerSchema, useAuth } from "@/hooks/use-auth";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Logo from "@/components/common/Logo";

export default function Register() {
  const [location, navigate] = useLocation();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  
  // Get redirect URL from query parameter
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('redirect') || '/account';
  };
  
  const form = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "buyer",
    },
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectUrl());
    }
  }, [isAuthenticated]);
  
  const onSubmit = async (data: RegisterCredentials) => {
    if (!agreeToTerms) {
      setTermsError("You must agree to the Terms and Conditions");
      return;
    }
    
    setTermsError("");
    
    try {
      await register(data);
      navigate(getRedirectUrl());
    } catch (error) {
      console.error("Registration error:", error);
      // Error is handled in the register function
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Create an Account - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
              <h1 className="text-2xl font-heading font-bold">Create an Account</h1>
              <p className="text-neutral-600 mt-1">
                Join UshopLS to start shopping from local Lesotho businesses
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              placeholder="Create a password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Confirm your password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => {
                          setAgreeToTerms(checked as boolean);
                          if (checked) setTermsError("");
                        }}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-neutral-700 cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link href="/terms">
                          <a className="text-primary hover:underline">
                            Terms and Conditions
                          </a>
                        </Link>
                      </label>
                    </div>
                    {termsError && (
                      <p className="text-red-500 text-sm">{termsError}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
                
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
                    Already have an account?{" "}
                    <Link href={`/login${location.includes('?') ? location.substring(location.indexOf('?')) : ''}`}>
                      <a className="text-primary font-medium hover:underline">
                        Sign In
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
