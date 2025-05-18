import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shop } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Rating from "@/components/common/Rating";

interface ShopCardProps {
  shop: Shop;
}

const ShopCard = ({ shop }: ShopCardProps) => {
  const { id, name, description, logo, banner, rating, reviewCount } = shop;
  
  // Get first letter of shop name for fallback logo
  const firstLetter = name.charAt(0).toUpperCase();
  
  // Random background color for shop avatar
  const colors = ["bg-primary", "bg-secondary", "bg-neutral-700"];
  const colorIndex = id % colors.length;
  const bgColor = colors[colorIndex];
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ 
          backgroundImage: banner 
            ? `url('${banner}')` 
            : "url('https://pixabay.com/get/g4b61a1519fc8b1d66f5f6b3b95c35d484c753a12f62e86277500fd680c3faef9c860805e20f5f44b33c2c34085c8de0ed4bff16da9cf1da2c110384aa650d3a4_1280.jpg')" 
        }}
      ></div>
      <div className="p-5">
        <div className="flex items-center">
          {logo ? (
            <img 
              src={logo} 
              alt={name} 
              className="w-14 h-14 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className={`w-14 h-14 ${bgColor} rounded-full mr-4 flex items-center justify-center text-white text-xl font-bold`}>
              {firstLetter}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-neutral-500 text-sm">
              {description?.substring(0, 50) || "Shop on UshopLS"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Rating value={rating} count={reviewCount} />
          <Link href={`/shops/${id}`}>
            <a className="text-primary font-medium text-sm hover:underline">Visit Shop</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ShopSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-5">
        <div className="flex items-center">
          <Skeleton className="w-14 h-14 rounded-full mr-4" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

const PopularShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/shops'],
    queryFn: async () => {
      const res = await fetch('/api/shops');
      if (!res.ok) throw new Error('Failed to fetch shops');
      return res.json() as Promise<Shop[]>;
    }
  });
  
  useEffect(() => {
    if (data) {
      setShops(data);
    }
  }, [data]);
  
  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Popular Shops</h2>
            <p className="text-neutral-600">Discover Lesotho's best local businesses</p>
          </div>
          <Link href="/shops">
            <a className="text-primary font-medium hidden md:block hover:underline">View All Shops</a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <ShopSkeleton key={i} />)
          ) : shops && shops.length > 0 ? (
            shops.map(shop => <ShopCard key={shop.id} shop={shop} />)
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-neutral-500">No shops found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/shops">
            <Button variant="link" className="text-primary font-medium hover:underline">
              View All Shops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularShops;
