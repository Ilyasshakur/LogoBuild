import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  CreditCard,
  Phone,
  Receipt,
  ShieldCheck,
} from "lucide-react";

// Checkout form schema
const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "ecocash", "bank", "credit_card"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with user data if available
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      notes: "",
      paymentMethod: "mpesa",
    },
  });
  
  // Check authentication and redirect if not logged in
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }
    
    // Redirect if cart is empty
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
      return;
    }
    
    // Update form values if user data changes
    if (user) {
      form.reset({
        ...form.getValues(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
    }
  }, [isAuthenticated, user, cartItems]);
  
  // Format price
  const formatPrice = (price: number) => {
    return `M ${price.toLocaleString()}`;
  };
  
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your purchase.",
        variant: "destructive",
      });
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add some products before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create order
      const orderResponse = await apiRequest('POST', '/api/orders', {
        userId: user.id,
        total: totalPrice,
        shippingAddress: `${data.address}, ${data.city}`,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
      });
      
      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }
      
      const orderData = await orderResponse.json();
      
      // Clear cart
      await clearCart();
      
      // Show success message
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${orderData.id} has been placed.`,
      });
      
      // Redirect to confirmation page
      navigate(`/order-confirmation/${orderData.id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      
      toast({
        title: "Checkout Failed",
        description: error.message || "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Checkout - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">
            Checkout
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+266 xxxxxxxx"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="123 Street Name, Area"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="maseru">Maseru</SelectItem>
                                  <SelectItem value="leribe">Leribe</SelectItem>
                                  <SelectItem value="berea">Berea</SelectItem>
                                  <SelectItem value="mafeteng">Mafeteng</SelectItem>
                                  <SelectItem value="mohale's hoek">Mohale's Hoek</SelectItem>
                                  <SelectItem value="quthing">Quthing</SelectItem>
                                  <SelectItem value="qacha's nek">Qacha's Nek</SelectItem>
                                  <SelectItem value="mokhotlong">Mokhotlong</SelectItem>
                                  <SelectItem value="thaba-tseka">Thaba-Tseka</SelectItem>
                                  <SelectItem value="butha-buthe">Butha-Buthe</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special instructions for delivery"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                        
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-3"
                                >
                                  <div className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-md p-3">
                                    <RadioGroupItem value="mpesa" id="mpesa" />
                                    <FormLabel htmlFor="mpesa" className="flex items-center cursor-pointer">
                                      <Phone className="h-5 w-5 mr-2 text-green-600" />
                                      M-Pesa
                                    </FormLabel>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-md p-3">
                                    <RadioGroupItem value="ecocash" id="ecocash" />
                                    <FormLabel htmlFor="ecocash" className="flex items-center cursor-pointer">
                                      <Phone className="h-5 w-5 mr-2 text-red-600" />
                                      EcoCash
                                    </FormLabel>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-md p-3">
                                    <RadioGroupItem value="bank" id="bank" />
                                    <FormLabel htmlFor="bank" className="flex items-center cursor-pointer">
                                      <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                                      Bank Transfer
                                    </FormLabel>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-md p-3">
                                    <RadioGroupItem value="credit_card" id="credit_card" />
                                    <FormLabel htmlFor="credit_card" className="flex items-center cursor-pointer">
                                      <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                                      Credit Card
                                    </FormLabel>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/cart")}
                          className="flex items-center"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Back to Cart
                        </Button>
                        
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            "Place Order"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-neutral-500">
                          {item.quantity} x {formatPrice(item.product.price)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.quantity * item.product.price)}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="bg-neutral-100 p-3 rounded-md w-full">
                    <div className="flex items-center text-sm text-neutral-600">
                      <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                      Your personal data will be used to process your order, support
                      your experience, and for other purposes described in our privacy
                      policy.
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
