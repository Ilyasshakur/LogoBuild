import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const ProductSkeleton = () => {
  return (
    <Card>
      <Skeleton className="h-64 w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
    queryFn: async () => {
      const res = await fetch('/api/products/featured');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<Product[]>;
    }
  });
  
  useEffect(() => {
    if (data) {
      setProducts(data);
    }
  }, [data]);
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Featured Products</h2>
            <p className="text-neutral-600">Discover our most popular items</p>
          </div>
          <Link href="/products" className="text-primary font-medium hidden md:block hover:underline">
            View All Products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          ) : products && products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-4 text-center py-12">
              <p className="text-neutral-500">No featured products found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/products" className="inline-block">
            <Button variant="link" className="text-primary font-medium hover:underline">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
