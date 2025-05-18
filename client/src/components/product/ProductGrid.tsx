import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/home/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductGridProps {
  filters?: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    availability?: string[];
    search?: string;
  };
}

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

const ProductGrid = ({ filters }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12;
  
  // Build query parameters based on filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters?.categories?.length === 1) {
      params.append('categoryId', filters.categories[0]);
    }
    
    if (filters?.minPrice !== undefined) {
      params.append('minPrice', filters.minPrice.toString());
    }
    
    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    return params.toString();
  };
  
  const queryString = buildQueryParams();
  const queryKey = queryString ? `/api/products?${queryString}` : '/api/products';
  
  const { data: products, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(queryKey);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<Product[]>;
    }
  });
  
  // Filter products based on availability if needed
  const filteredProducts = products?.filter(product => {
    if (!filters?.availability?.length) return true;
    
    if (filters.availability.includes('in-stock') && product.stock > 0) {
      return true;
    }
    
    if (filters.availability.includes('out-of-stock') && product.stock === 0) {
      return true;
    }
    
    return false;
  });
  
  // Calculate pagination
  useEffect(() => {
    if (filteredProducts) {
      setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [filteredProducts]);
  
  // Get current page products
  const getCurrentPageProducts = () => {
    if (!filteredProducts) return [];
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };
  
  const currentProducts = getCurrentPageProducts();
  
  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current and pages around current
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }
  
  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-neutral-500">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page as number);
                    }}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductGrid;
