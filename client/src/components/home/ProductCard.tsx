import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Rating from "@/components/common/Rating";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    id,
    name,
    price,
    comparePrice,
    images,
    slug,
    rating,
    reviewCount
  } = product;
  
  // Get first image or fallback
  const image = images && images.length > 0 
    ? images[0] 
    : "https://placehold.co/600x600/eee/999?text=No+Image";
  
  // Format price
  const formatPrice = (price: number) => {
    return `M ${price.toLocaleString()}`;
  };
  
  // Check if product is on sale
  const isOnSale = comparePrice && comparePrice > price;
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`
    });
  };
  
  return (
    <Card 
      className="bg-white rounded-lg border border-neutral-200 overflow-hidden transition-all hover:shadow-md group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link href={`/products/${slug}`} className="block">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-64 object-cover object-center"
          />
        </Link>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-500 hover:text-primary transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-1 text-sm text-neutral-500">
          Brand Name
        </div>
        <Link href={`/products/${slug}`} className="block">
          <h3 className="font-medium text-neutral-800 mb-1 group-hover:text-primary">
            {name}
          </h3>
        </Link>
        <div className="mb-2">
          <Rating value={rating || 0} count={reviewCount || 0} />
        </div>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-lg">
            {isOnSale && (
              <>
                <span className="text-red-500">{formatPrice(price)}</span>
                <span className="text-neutral-400 text-sm line-through ml-1">
                  {formatPrice(comparePrice!)}
                </span>
              </>
            )}
            {!isOnSale && formatPrice(price)}
          </div>
          <Button 
            onClick={handleAddToCart}
            variant="default" 
            size="icon" 
            className="bg-primary hover:bg-primary-dark text-white p-2 rounded-md transition"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
