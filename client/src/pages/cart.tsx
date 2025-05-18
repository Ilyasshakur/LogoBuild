import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import CartItem from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowRight, ChevronLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

export default function Cart() {
  const [, navigate] = useLocation();
  const { cartItems, totalPrice, isLoading, syncCartWithBackend } = useCart();
  const { isAuthenticated, user, checkAuth } = useAuth();

  // Check auth state and sync cart on page load
  useEffect(() => {
    checkAuth();
    
    if (isAuthenticated) {
      syncCartWithBackend();
    }
  }, [isAuthenticated]);
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }
    
    navigate("/checkout");
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return `M ${price.toLocaleString()}`;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">
            Your Shopping Cart
          </h1>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart is Empty - UshopLS</title>
        </Helmet>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <ShoppingCart className="h-16 w-16 text-neutral-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Your cart is empty
            </h1>
            <p className="text-neutral-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary-dark">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Your Shopping Cart - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">
            Your Shopping Cart
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  product={item.product}
                  quantity={item.quantity}
                />
              ))}
              
              <div className="mt-4">
                <Link href="/products">
                  <Button variant="outline" className="flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary-dark flex items-center justify-center"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 bg-white p-4 rounded-lg border border-neutral-200">
                <h3 className="font-medium mb-2">Accepted Payment Methods</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-neutral-100 px-3 py-1 rounded text-sm">M-Pesa</div>
                  <div className="bg-neutral-100 px-3 py-1 rounded text-sm">EcoCash</div>
                  <div className="bg-neutral-100 px-3 py-1 rounded text-sm">Credit Card</div>
                  <div className="bg-neutral-100 px-3 py-1 rounded text-sm">Bank Transfer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
