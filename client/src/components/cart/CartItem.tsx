import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface CartItemProps {
  id: number;
  product: Product;
  quantity: number;
}

const CartItem = ({ id, product, quantity }: CartItemProps) => {
  const { updateCartItemQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Get first image or fallback
  const image = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://placehold.co/600x600/eee/999?text=No+Image";
  
  // Format price
  const formatPrice = (price: number) => {
    return `M ${price.toLocaleString()}`;
  };
  
  const handleQuantityChange = (newQuantity: string) => {
    updateCartItemQuantity(id, parseInt(newQuantity));
  };
  
  const handleRemove = () => {
    setIsRemoving(true);
    removeFromCart(id);
  };
  
  // Generate quantity options based on available stock
  const generateQuantityOptions = () => {
    const options = [];
    const maxQuantity = Math.min(product.stock, 10); // Limit to 10 or available stock
    
    for (let i = 1; i <= maxQuantity; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          {i}
        </SelectItem>
      );
    }
    
    return options;
  };
  
  return (
    <Card className={`border-neutral-200 mb-4 transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:mr-4 mb-4 sm:mb-0">
            <Link href={`/products/${product.slug}`}>
              <a>
                <img 
                  src={image} 
                  alt={product.name}
                  className="w-full sm:w-24 h-24 object-cover rounded-md"
                />
              </a>
            </Link>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <Link href={`/products/${product.slug}`}>
                  <a className="font-medium text-neutral-800 hover:text-primary mb-1 block">
                    {product.name}
                  </a>
                </Link>
                <p className="text-sm text-neutral-500 mb-2">
                  {product.categoryId ? "Category" : ""}
                </p>
              </div>
              
              <div className="flex flex-col items-start sm:items-end">
                <span className="font-semibold">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-neutral-400 text-sm line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center mt-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm mr-2">Qty:</span>
                <Select
                  value={quantity.toString()}
                  onValueChange={handleQuantityChange}
                  disabled={isRemoving}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateQuantityOptions()}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
