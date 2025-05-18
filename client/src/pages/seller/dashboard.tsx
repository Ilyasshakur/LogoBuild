import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  ChevronRight,
} from "lucide-react";

export default function SellerDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();

  // Check if user is authenticated and is a seller
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/seller/dashboard");
      return;
    }
    
    if (user && user.role !== "seller") {
      navigate("/account");
      toast({
        title: "Access Denied",
        description: "You don't have seller privileges.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user]);

  // Get seller's shop
  const { data: shop, isLoading: isLoadingShop } = useQuery({
    queryKey: ['/api/shops/seller/' + user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch('/api/shops/seller/' + user.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch shop details');
      return res.json();
    },
    enabled: !!user,
  });

  // Get seller's products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products/seller/' + user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/products/seller/' + user.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    enabled: !!user,
  });

  // Get seller's orders
  const { data: sellerOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/seller/orders'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/seller/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: !!user,
  });

  // Mock data for sales chart (this would be real data in production)
  const salesData = [
    { name: "Jan", sales: 2400 },
    { name: "Feb", sales: 1398 },
    { name: "Mar", sales: 9800 },
    { name: "Apr", sales: 3908 },
    { name: "May", sales: 4800 },
    { name: "Jun", sales: 3800 },
    { name: "Jul", sales: 4300 },
  ];

  // Mock data for status distribution
  const pieData = [
    { name: "Delivered", value: 45, color: "#10B981" },
    { name: "Processing", value: 30, color: "#F59E0B" },
    { name: "Pending", value: 15, color: "#3B82F6" },
    { name: "Cancelled", value: 10, color: "#EF4444" },
  ];

  // Calculate summary stats
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.status === "approved")?.length || 0;
  const pendingProducts = products?.filter(p => p.status === "pending")?.length || 0;
  const totalOrders = sellerOrders?.length || 0;
  const salesRevenueTotal = sellerOrders?.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
  }, 0) || 0;

  // Recent orders for display
  const recentOrders = sellerOrders?.slice(0, 5) || [];

  if (!isAuthenticated || (user && user.role !== "seller")) {
    return null;
  }

  // Loading state
  if (isLoadingShop || isLoadingProducts || isLoadingOrders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-neutral-200 rounded"></div>
              ))}
            </div>
            <div className="h-72 bg-neutral-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-neutral-200 rounded"></div>
              <div className="h-96 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-2">
            <Home className="h-4 w-4 mr-2" />
            <Link href="/">
              <a className="text-neutral-500 hover:text-primary text-sm">Home</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
            <span className="text-sm">Seller Dashboard</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
                Seller Dashboard
              </h1>
              <p className="text-neutral-600">
                {shop ? `Welcome back, ${shop.name}` : "Welcome to your seller dashboard"}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              {!shop && (
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/seller/register")}
                >
                  Create Shop
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate("/seller/products/new")}
              >
                Add New Product
              </Button>
            </div>
          </div>
          
          {!shop ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Complete Your Shop Setup</CardTitle>
                <CardDescription>
                  You need to create a shop before you can start selling products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Set up your shop profile with your business information, logo, and 
                  other details to start selling on UshopLS.
                </p>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/seller/register")}
                >
                  Create Your Shop
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold">M {salesRevenueTotal.toLocaleString()}</h3>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Total Products</p>
                        <h3 className="text-2xl font-bold">{totalProducts}</h3>
                        <p className="text-sm text-green-600">{activeProducts} Active</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Total Orders</p>
                        <h3 className="text-2xl font-bold">{totalOrders}</h3>
                      </div>
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Customers</p>
                        <h3 className="text-2xl font-bold">{sellerOrders?.reduce((acc, curr) => {
                          if (!acc.includes(curr.customer?.id)) {
                            acc.push(curr.customer?.id);
                          }
                          return acc;
                        }, []).length || 0}</h3>
                      </div>
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            
              {/* Sales Chart */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Your sales performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={salesData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip 
                          formatter={(value) => [`M ${value}`, 'Sales']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#0F4C81"
                          fillOpacity={1} 
                          fill="url(#colorSales)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your latest customer orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentOrders.length > 0 ? (
                      <div className="space-y-4">
                        {recentOrders.map((order, index) => (
                          <div key={order.orderId} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">Order #{order.orderId}</div>
                              <div className="text-sm text-neutral-500">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm mb-1">
                              <span className="text-neutral-500">Customer: </span>
                              <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                                  order.status === "delivered" ? "bg-green-100 text-green-800" : 
                                  order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                                  order.status === "processing" ? "bg-amber-100 text-amber-800" :
                                  order.status === "cancelled" ? "bg-red-100 text-red-800" :
                                  "bg-neutral-100 text-neutral-800"
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                                <span className="text-sm">
                                  {order.items.length} item(s)
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/seller/orders/${order.orderId}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-neutral-600">
                          You haven't received any orders yet.
                        </p>
                      </div>
                    )}
                    
                    {recentOrders.length > 0 && (
                      <div className="mt-4 text-center">
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/seller/orders")}
                        >
                          View All Orders
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              
                {/* Order Status Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>Distribution of your order status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}`, 'Orders']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Product Overview */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Product Overview</CardTitle>
                      <CardDescription>Manage your product inventory</CardDescription>
                    </div>
                    <Button
                      onClick={() => navigate("/seller/products")}
                    >
                      View All Products
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 font-medium text-neutral-500">Product</th>
                          <th className="text-left py-3 font-medium text-neutral-500">Price</th>
                          <th className="text-left py-3 font-medium text-neutral-500">Stock</th>
                          <th className="text-left py-3 font-medium text-neutral-500">Status</th>
                          <th className="text-left py-3 font-medium text-neutral-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products && products.length > 0 ? (
                          products.slice(0, 5).map((product) => (
                            <tr key={product.id} className="border-b border-neutral-200">
                              <td className="py-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-neutral-100 rounded-md overflow-hidden mr-3">
                                    {product.images && product.images.length > 0 ? (
                                      <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                        <ShoppingBag className="h-5 w-5 text-neutral-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-neutral-500">{product.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 font-medium">
                                M {product.price.toLocaleString()}
                              </td>
                              <td className="py-4">
                                <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.status === "approved" ? "bg-green-100 text-green-800" : 
                                  product.status === "pending" ? "bg-amber-100 text-amber-800" :
                                  product.status === "rejected" ? "bg-red-100 text-red-800" :
                                  "bg-neutral-100 text-neutral-800"
                                }`}>
                                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                                >
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center">
                              <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium mb-2">No products yet</h3>
                              <p className="text-neutral-600 mb-4">
                                You haven't added any products to your shop.
                              </p>
                              <Button
                                className="bg-primary hover:bg-primary-dark"
                                onClick={() => navigate("/seller/products/new")}
                              >
                                Add Product
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
