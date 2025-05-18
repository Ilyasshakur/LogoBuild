import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Package,
  Heart,
  LogOut,
  Settings,
  Edit,
} from "lucide-react";

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Account() {
  const [, navigate] = useLocation();
  const { user, logout, checkAuth, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Check authentication
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/account");
    }
  }, [isAuthenticated]);

  // Get user details
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user details');
      return res.json() as Promise<User>;
    },
    enabled: isAuthenticated,
  });

  // Get orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Get wishlist
  const { data: wishlist, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      city: userData?.city || "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
      });
    }
  }, [userData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest('PUT', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    },
  });

  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      return apiRequest('PUT', `/api/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "There was an error changing your password.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  if (isLoading || !userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-4 gap-8">
              <div className="h-10 bg-neutral-200 rounded col-span-1"></div>
              <div className="col-span-3">
                <div className="h-10 bg-neutral-200 rounded w-full mb-4"></div>
                <div className="h-48 bg-neutral-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Account - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-8">
              My Account
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Account Sidebar */}
              <div className="col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant={activeTab === "profile" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("profile")}
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        variant={activeTab === "orders" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("orders")}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                      </Button>
                      <Button
                        variant={activeTab === "wishlist" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("wishlist")}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Button>
                      <Button
                        variant={activeTab === "settings" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Button>
                      
                      <Separator className="my-2" />
                      
                      <Button
                        variant="ghost"
                        className="justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {user?.role === "seller" && (
                  <Card className="mt-4">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium">Seller Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button 
                        className="w-full bg-primary hover:bg-primary-dark"
                        onClick={() => navigate("/seller/dashboard")}
                      >
                        Go to Seller Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {user?.role === "admin" && (
                  <Card className="mt-4">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium">Admin Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button 
                        className="w-full bg-primary hover:bg-primary-dark"
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        Go to Admin Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Account Content */}
              <div className="col-span-1 md:col-span-3">
                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        View and update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
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
                              control={profileForm.control}
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
                          
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+266 xxxxxxxx" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Street, Area" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Maseru" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary-dark"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "orders" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        View all your orders and their status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-neutral-100 p-4 rounded-md">
                              <div className="h-5 bg-neutral-200 rounded w-1/4 mb-4"></div>
                              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                              <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order: any) => (
                            <div key={order.id} className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                              <div className="flex flex-wrap justify-between mb-2">
                                <div>
                                  <span className="font-medium">Order #{order.id}</span>
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap justify-between mb-2">
                                <div className="text-sm">
                                  <span className="text-neutral-500">Status: </span>
                                  <span className={`font-medium ${
                                    order.status === "delivered" ? "text-green-600" : 
                                    order.status === "shipped" ? "text-blue-600" :
                                    order.status === "processing" ? "text-amber-600" :
                                    order.status === "cancelled" ? "text-red-600" :
                                    "text-neutral-600"
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                                <div className="font-medium">
                                  M {order.total.toLocaleString()}
                                </div>
                              </div>
                              
                              <div className="text-sm text-neutral-600 mb-3">
                                {order.items?.length || 0} item(s)
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/order-details/${order.id}`)}
                              >
                                View Order Details
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                          <p className="text-neutral-600 mb-4">
                            You haven't placed any orders yet.
                          </p>
                          <Button
                            onClick={() => navigate("/products")}
                            className="bg-primary hover:bg-primary-dark"
                          >
                            Start Shopping
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "wishlist" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Wishlist</CardTitle>
                      <CardDescription>
                        Products you've saved for later
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingWishlist ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-md border border-neutral-200 overflow-hidden">
                              <div className="h-40 bg-neutral-200 rounded-t"></div>
                              <div className="p-3">
                                <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-neutral-200 rounded w-full mt-2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : wishlist && wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {wishlist.map((item: any) => (
                            <div key={item.id} className="bg-white rounded-md border border-neutral-200 overflow-hidden">
                              <div 
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: `url(${item.product.images?.[0] || "https://placehold.co/600x400?text=No+Image"})` }}
                              ></div>
                              <div className="p-3">
                                <h3 
                                  className="font-medium mb-1 hover:text-primary cursor-pointer"
                                  onClick={() => navigate(`/products/${item.product.slug}`)}
                                >
                                  {item.product.name}
                                </h3>
                                <div className="font-bold mb-2">
                                  M {item.product.price.toLocaleString()}
                                </div>
                                <Button
                                  className="w-full bg-primary hover:bg-primary-dark"
                                  size="sm"
                                  onClick={() => navigate(`/products/${item.product.slug}`)}
                                >
                                  View Product
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                          <p className="text-neutral-600 mb-4">
                            Save items you like for later by clicking the heart icon on product pages.
                          </p>
                          <Button
                            onClick={() => navigate("/products")}
                            className="bg-primary hover:bg-primary-dark"
                          >
                            Browse Products
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>
                          Manage your account preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <h3 className="text-lg font-medium mb-2">Account Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Username:</span>
                              <span className="ml-2 text-neutral-600">{userData.username}</span>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>
                              <span className="ml-2 text-neutral-600">{userData.email}</span>
                            </div>
                            <div>
                              <span className="font-medium">Account Type:</span>
                              <span className="ml-2 text-neutral-600 capitalize">{userData.role}</span>
                            </div>
                            <div>
                              <span className="font-medium">Member Since:</span>
                              <span className="ml-2 text-neutral-600">
                                {new Date(userData.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {user?.role === "buyer" && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-4">Become a Seller</h3>
                            <p className="text-neutral-600 mb-4">
                              Want to sell products on UshopLS? Upgrade your account to a seller account.
                            </p>
                            <Button 
                              onClick={() => navigate("/seller/register")}
                              className="bg-primary hover:bg-primary-dark"
                            >
                              Become a Seller
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                          Update your password to enhance security
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-primary-dark"
                              disabled={changePasswordMutation.isPending}
                            >
                              {changePasswordMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Updating...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
