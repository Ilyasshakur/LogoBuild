
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<Category[]>;
    },
  });

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto whitespace-nowrap py-2 -mx-4 px-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="h-5 w-20 bg-primary-dark/30 animate-pulse rounded mx-3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary">
      <div className="container mx-auto px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center py-2">
            <Link href="/products" className="text-white hover:text-secondary px-3 py-1 font-medium text-sm">
              All Categories
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="text-white hover:text-secondary px-3 py-1 font-medium text-sm">
                {category.name}
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CategoryMenu;
