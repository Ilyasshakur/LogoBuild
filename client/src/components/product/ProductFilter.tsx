import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterX } from "lucide-react";

interface ProductFilterProps {
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onFilterChange: (filters: any) => void;
}

const ProductFilter = ({
  selectedCategory,
  minPrice = 0,
  maxPrice = 50000,
  search,
  onFilterChange
}: ProductFilterProps) => {
  const [location, navigate] = useLocation();
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice || 0, maxPrice || 50000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedCategory ? [selectedCategory] : []
  );
  const [availability, setAvailability] = useState<string[]>([]);
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<Category[]>;
    }
  });
  
  useEffect(() => {
    if (selectedCategory && !selectedCategories.includes(selectedCategory)) {
      setSelectedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleCategoryChange = (slug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, slug]);
    } else {
      setSelectedCategories(prev => prev.filter(cat => cat !== slug));
    }
  };

  const handleAvailabilityChange = (value: string, checked: boolean) => {
    if (checked) {
      setAvailability(prev => [...prev, value]);
    } else {
      setAvailability(prev => prev.filter(item => item !== value));
    }
  };

  const applyFilters = () => {
    const filters = {
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      availability,
      search
    };
    onFilterChange(filters);
    
    // Update URL
    const params = new URLSearchParams();
    if (selectedCategories.length === 1) {
      params.set('category', selectedCategories[0]);
    }
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < 50000) {
      params.set('maxPrice', priceRange[1].toString());
    }
    if (search) {
      params.set('search', search);
    }
    if (availability.length > 0) {
      params.set('availability', availability.join(','));
    }
    
    navigate(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedCategories([]);
    setAvailability([]);
    onFilterChange({});
    navigate('/products');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-neutral-500 hover:text-primary"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
      
      <Accordion type="multiple" defaultValue={["category", "price", "availability"]}>
        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={selectedCategories.includes(category.slug)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.slug, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2">
              <Slider
                defaultValue={[priceRange[0], priceRange[1]]}
                value={[priceRange[0], priceRange[1]]}
                max={50000}
                step={100}
                onValueChange={handlePriceChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-neutral-500">
                <span>M {priceRange[0].toLocaleString()}</span>
                <span>M {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Availability */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={availability.includes('in-stock')}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange('in-stock', checked as boolean)
                  }
                />
                <Label
                  htmlFor="in-stock"
                  className="text-sm cursor-pointer"
                >
                  In Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="out-of-stock"
                  checked={availability.includes('out-of-stock')}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange('out-of-stock', checked as boolean)
                  }
                />
                <Label
                  htmlFor="out-of-stock"
                  className="text-sm cursor-pointer"
                >
                  Out of Stock
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        onClick={applyFilters}
        className="w-full mt-4 bg-primary hover:bg-primary-dark"
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default ProductFilter;
