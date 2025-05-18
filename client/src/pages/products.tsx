import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import ProductFilter from "@/components/product/ProductFilter";
import ProductGrid from "@/components/product/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [title, setTitle] = useState("All Products - UshopLS");
  
  // Get query parameters
  const getQueryParams = () => {
    const params = new URLSearchParams(location.split('?')[1]);
    
    return {
      search: params.get('search') || "",
      category: params.get('category') || "",
      minPrice: params.get('minPrice') ? parseInt(params.get('minPrice')!) : 0,
      maxPrice: params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : 50000,
    };
  };
  
  const { search, category, minPrice, maxPrice } = getQueryParams();
  
  // Fetch category details if category is provided
  const { data: categoryDetails } = useQuery({
    queryKey: ['/api/categories/slug/' + category],
    queryFn: async () => {
      if (!category) return null;
      
      const res = await fetch('/api/categories/slug/' + category);
      if (!res.ok) return null;
      
      return res.json() as Promise<Category>;
    },
    enabled: !!category
  });
  
  // Initialize search and filters from URL
  useEffect(() => {
    setSearchQuery(search);
    
    const initialFilters: any = {};
    
    if (category) {
      initialFilters.categories = [category];
    }
    
    if (minPrice > 0) {
      initialFilters.minPrice = minPrice;
    }
    
    if (maxPrice < 50000) {
      initialFilters.maxPrice = maxPrice;
    }
    
    if (search) {
      initialFilters.search = search;
    }
    
    setFilters(initialFilters);
  }, [search, category, minPrice, maxPrice]);
  
  // Update title based on category
  useEffect(() => {
    if (categoryDetails) {
      setTitle(`${categoryDetails.name} - UshopLS`);
    } else if (search) {
      setTitle(`Search results for "${search}" - UshopLS`);
    } else {
      setTitle("All Products - UshopLS");
    }
  }, [categoryDetails, search]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedFilters = { ...filters, search: searchQuery };
    setFilters(updatedFilters);
  };
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta 
          name="description" 
          content={categoryDetails?.description || `Browse our wide selection of products on UshopLS, Lesotho's premier online marketplace.`}
        />
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                {categoryDetails?.name || (search ? `Search: ${search}` : "All Products")}
              </h1>
              <p className="text-neutral-600">
                {categoryDetails?.description || "Browse our selection of products from across Lesotho"}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <form onSubmit={handleSearch} className="flex">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 rounded-r-none"
                />
                <Button 
                  type="submit"
                  className="rounded-l-none"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
          
          <div className="block md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex justify-between items-center"
                  onClick={() => setShowFilters(true)}
                >
                  <span>Filters</span>
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Refine your product search with these filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilter
                    selectedCategory={category}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    search={search}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block">
              <ProductFilter
                selectedCategory={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                search={search}
                onFilterChange={handleFilterChange}
              />
            </div>
            <div className="md:col-span-3">
              <ProductGrid filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
