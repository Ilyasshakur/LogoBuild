import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Shop, Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Store, 
  Check, 
  AlertCircle,
} from "lucide-react";
import Rating from "@/components/common/Rating";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:slug");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  
  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: [`/api/products/slug/${params?.slug}`],
    queryFn: async () => {
      if (!params?.slug) return null;
      const res = await fetch(`/api/products/slug/${params.slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          navigate("/not-found");
          return null;
        }
        throw new Error("Failed to fetch product");
      }
      return res.json() as Promise<Product>;
    },
    enabled: !!params?.slug,
  });
  
  // Set active image when product data is loaded
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);
  
  // Fetch shop details
  const { data: shop } = useQuery({
    queryKey: [`/api/shops/seller/${product?.sellerId}`],
    queryFn: async () => {
      if (!product?.sellerId) return null;
      const res = await fetch(`/api/shops/seller/${product.sellerId}`);
      if (!res.ok) return null;
      return res.json() as Promise<Shop>;
    },
    enabled: !!product?.sellerId,
  });
  
  // Fetch product reviews
  const { data: reviews } = useQuery({
    queryKey: [`/api/products/${product?.id}/reviews`],
    queryFn: async () => {
      if (!product?.id) return [];
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (!res.ok) return [];
      return res.json() as Promise<Review[]>;
    },
    enabled: !!product?.id,
  });
  
  if (!match || isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-neutral-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-6 bg-neutral-200 rounded w-1/3 mt-4"></div>
              <div className="h-32 bg-neutral-200 rounded w-full mt-4"></div>
              <div className="h-12 bg-neutral-200 rounded w-full mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return null;
  }
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };
  
  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }
    
    // This would normally call an API to add to wishlist
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return `M ${price.toLocaleString()}`;
  };
  
  // Check if product is on sale
  const isOnSale = product.comparePrice && product.comparePrice > product.price;
  
  // Calculate discount percentage
  const discountPercentage = isOnSale 
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) 
    : 0;
  
  // Get stock status label and color
  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { label: "Out of Stock", color: "text-red-500", icon: AlertCircle };
    } else if (product.stock <= 5) {
      return { label: "Low Stock", color: "text-amber-500", icon: AlertCircle };
    } else {
      return { label: "In Stock", color: "text-green-500", icon: Check };
    }
  };
  
  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  
  return (
    <>
      <Helmet>
        <title>{`${product.name} - UshopLS`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products?category=${product.categoryId}`}>
                  {product.categoryId ? "Category" : "Products"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink>{product.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="bg-white rounded-lg overflow-hidden mb-4 flex items-center justify-center h-96">
                <img 
                  src={activeImage || (product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/600x600/eee/999?text=No+Image")} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`bg-white rounded-lg overflow-hidden h-20 cursor-pointer border-2 ${activeImage === image ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setActiveImage(image)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <Rating value={product.rating} count={product.reviewCount} showCount />
              </div>
              
              <div className="mb-6">
                {isOnSale ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-red-500">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-neutral-400 line-through">
                      {formatPrice(product.comparePrice!)}
                    </span>
                    <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-6">
                <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
                <span className={stockStatus.color}>
                  {stockStatus.label}
                  {product.stock > 0 && product.stock <= 10 && ` (Only ${product.stock} left)`}
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-neutral-700">{product.description}</p>
              </div>
              
              {product.stock > 0 && (
                <div className="flex items-center mb-6">
                  <div className="flex items-center border border-neutral-300 rounded-md mr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-r-none text-neutral-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">{quantity}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 rounded-l-none text-neutral-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="bg-primary hover:bg-primary-dark text-white mr-2 flex-grow"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddToWishlist}
                    className="ml-2"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {shop && (
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Store className="h-4 w-4 mr-2" />
                      Sold by
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary rounded-full mr-3 flex items-center justify-center text-white font-bold">
                          {shop.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{shop.name}</h3>
                        <div className="flex items-center text-sm">
                          <Rating 
                            value={shop.rating} 
                            count={shop.reviewCount} 
                            showCount 
                            size="sm" 
                            className="mr-2"
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => navigate(`/shops/${shop.id}`)}
                      >
                        Visit Shop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Product details, specs, reviews tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({product.reviewCount || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="bg-white rounded-lg p-6">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Product Description</h2>
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="bg-white rounded-lg p-6">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
                  <p>Detailed specifications for this product are not available.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
                
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <div className="text-3xl font-bold">{product.rating.toFixed(1)}</div>
                    <Rating value={product.rating} size="md" />
                    <div className="text-sm text-neutral-500 mt-1">
                      {product.reviewCount || 0} reviews
                    </div>
                  </div>
                  
                  {/* Rating breakdown would go here */}
                </div>
                
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">
                            {review.user?.firstName || review.user?.username || "Anonymous"}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Rating value={review.rating} className="mb-2" />
                        <p className="text-neutral-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No reviews yet.</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <Button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast({
                          title: "Authentication required",
                          description: "Please sign in to write a review.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // This would normally open a review form or modal
                      toast({
                        title: "Feature coming soon",
                        description: "The ability to write reviews is coming soon.",
                      });
                    }}
                  >
                    Write a Review
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
