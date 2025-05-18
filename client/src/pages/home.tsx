import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PopularShops from "@/components/home/PopularShops";
import SellerCTA from "@/components/home/SellerCTA";
import Testimonials from "@/components/home/Testimonials";
import AppCTA from "@/components/home/AppCTA";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export default function Home() {
  const { isAuthenticated, checkAuth } = useAuth();
  const { syncCartWithBackend } = useCart();
  
  // Check auth state and sync cart on page load
  useEffect(() => {
    checkAuth();
    
    if (isAuthenticated) {
      syncCartWithBackend();
    }
  }, [isAuthenticated]);
  
  return (
    <>
      <Helmet>
        <title>UshopLS – Your Local Market, Online</title>
        <meta 
          name="description" 
          content="UshopLS is Lesotho's premier online marketplace connecting local businesses with customers nationwide. Shop anytime, anywhere for the best local products."
        />
      </Helmet>
      
      <Hero />
      <Features />
      <CategorySection />
      <FeaturedProducts />
      <PopularShops />
      <SellerCTA />
      <Testimonials />
      <AppCTA />
    </>
  );
}
