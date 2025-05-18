import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryCard = ({ category }: { category: Category }) => {
  const { id, name, slug, image } = category;
  
  // Default image to use if no category image is provided
  const defaultImages: {[key: string]: string} = {
    "electronics": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "fashion": "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "home-garden": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "health-beauty": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "sports": "https://pixabay.com/get/gcff0e30b9a9cf73b506f1c2a3dc65c3f6aba487d97f2c48f58c0c58e82c77f67c13a9c9de3fc08e3bb19a99c29d65fad_1280.jpg",
    "toys-games": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "restaurants": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "food-groceries": "https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "local-cuisine": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "phones-gadgets": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
  };
  
  // Find the right image to use
  const bgImage = image || defaultImages[slug] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  
  return (
    <Link href={`/products?category=${slug}`} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1 group block">
        <div 
          className="h-32 bg-cover bg-center bg-neutral-200" 
          style={{ backgroundImage: `url('${bgImage}')` }}
        ></div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-neutral-800 group-hover:text-primary">{name}</h3>
          <p className="text-xs text-neutral-500">Browse Products</p>
        </div>
    </Link>
  );
};

const CategorySkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-24 mx-auto mb-2" />
        <Skeleton className="h-3 w-20 mx-auto" />
      </CardContent>
    </Card>
  );
};

const CategorySection = () => {
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<Category[]>;
    }
  });
  
  useEffect(() => {
    if (categories) {
      // Prioritize restaurants, food, and phones categories by custom sorting
      const sortedCategories = [...categories].sort((a, b) => {
        // Priority categories to display first
        const priorityOrder: {[key: string]: number} = {
          "restaurants": 1,
          "phones-gadgets": 2,
          "food-groceries": 3,
          "local-cuisine": 4
        };
        
        // Calculate priority (-1 = high priority, Infinity = default priority)
        const priorityA = priorityOrder[a.slug] || Infinity;
        const priorityB = priorityOrder[b.slug] || Infinity;
        
        return priorityA - priorityB;
      });
      
      // Only display first 6 categories
      setDisplayCategories(sortedCategories.slice(0, 6));
    }
  }, [categories]);
  
  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Shop by Category</h2>
            <p className="text-neutral-600">Find what you need from our curated collections</p>
          </div>
          <Link href="/products" className="text-primary font-medium hidden md:block hover:underline">
            View All Categories
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading 
            ? Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
            : displayCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))
          }
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/products" className="inline-block">
            <Button variant="link" className="text-primary font-medium hover:underline">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
