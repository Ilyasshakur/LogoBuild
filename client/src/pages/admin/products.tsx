import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminProducts() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/admin/products");
      return;
    }
    
    if (user && user.role !== "admin") {
      navigate("/account");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Manage Products - Admin Dashboard - UshopLS</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
        <p>Product management interface will be implemented here.</p>
      </div>
    </>
  );
}