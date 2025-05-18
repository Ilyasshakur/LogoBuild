import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
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
  Users,
  ShoppingBag,
  Store,
  TrendingUp,
  ShieldCheck,
  Home,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/admin/dashboard");
      return;
    }
    
    if (user && user.role !== "admin") {
      navigate("/account");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user]);

  // Get users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      // This endpoint doesn't exist yet, so we'll mock the response
      return [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'seller1', role: 'seller' },
        { id: 3, username: 'seller2', role: 'seller' },
        { id: 4, username: 'buyer1', role: 'buyer' },
        { id: 5, username: 'buyer2', role: 'buyer' },
        { id: 6, username: 'buyer3', role: 'buyer' },
      ];
    },
    enabled: !!user && isAuthenticated && user.role === 'admin',
  });

  // Get products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    enabled: !!user && isAuthenticated && user.role === 'admin',
  });

  // Get shops
  const { data: shops, isLoading: isLoadingShops } = useQuery({
    queryKey: ['/api/shops'],
    queryFn: async () => {
      const res = await fetch('/api/shops');
      if (!res.ok) throw new Error('Failed to fetch shops');
      return res.json();
    },
    enabled: !!user && isAuthenticated && user.role === 'admin',
  });

  // Get orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      // This endpoint doesn't exist yet, so we'll mock the response
      return [
        { id: 1, status: 'delivered', total: 2499 },
        { id: 2, status: 'processing', total: 5999 },
        { id: 3, status: 'shipped', total: 1299 },
        { id: 4, status: 'pending', total: 899 },
        { id: 5, status: 'delivered', total: 12999 },
        { id: 6, status: 'cancelled', total: 3499 },
      ];
    },
    enabled: !!user && isAuthenticated && user.role === 'admin',
  });

  // Mock data for sales chart
  const salesData = [
    { name: "Jan", sales: 24000 },
    { name: "Feb", sales: 13980 },
    { name: "Mar", sales: 98000 },
    { name: "Apr", sales: 39080 },
    { name: "May", sales: 48000 },
    { name: "Jun", sales: 38000 },
    { name: "Jul", sales: 43000 },
  ];

  // Mock data for user distribution
  const userData = [
    { name: "Buyers", value: users?.filter(u => u.role === 'buyer').length || 0, color: "#3B82F6" },
    { name: "Sellers", value: users?.filter(u => u.role === 'seller').length || 0, color: "#F59E0B" },
    { name: "Admins", value: users?.filter(u => u.role === 'admin').length || 0, color: "#10B981" },
  ];

  // Mock data for product status
  const productStatusData = [
    { name: "Approved", value: products?.filter(p => p.status === 'approved').length || 0, color: "#10B981" },
    { name: "Pending", value: products?.filter(p => p.status === 'pending').length || 0, color: "#F59E0B" },
    { name: "Rejected", value: products?.filter(p => p.status === 'rejected').length || 0, color: "#EF4444" },
  ];

  // Calculate summary stats
  const totalUsers = users?.length || 0;
  const totalSellers = users?.filter(u => u.role === 'seller').length || 0;
  const totalProducts = products?.length || 0;
  const pendingProducts = products?.filter(p => p.status === 'pending').length || 0;
  const totalOrders = orders?.length || 0;
  const salesRevenueTotal = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null;
  }

  // Loading state
  if (isLoadingUsers || isLoadingProducts || isLoadingShops || isLoadingOrders) {
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
        <title>Admin Dashboard - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-2">
            <Home className="h-4 w-4 mr-2" />
            <Link href="/" className="text-neutral-500 hover:text-primary text-sm">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
            <span className="text-sm">Admin Dashboard</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
                Admin Dashboard
              </h1>
              <p className="text-neutral-600">
                Manage and monitor your marketplace
              </p>
            </div>
          </div>
          
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
                    <p className="text-sm font-medium text-neutral-500">Total Users</p>
                    <h3 className="text-2xl font-bold">{totalUsers}</h3>
                    <p className="text-sm text-blue-600">{totalSellers} Sellers</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
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
                    <p className="text-sm text-amber-600">{pendingProducts} Pending</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Total Shops</p>
                    <h3 className="text-2xl font-bold">{shops?.length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sales Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Total sales performance over time</CardDescription>
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
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Users']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
                <CardDescription>Breakdown of product approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Products']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Pending Products</CardTitle>
                <CardDescription>Products awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-500 mb-4">
                  {pendingProducts}
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/admin/products?status=pending")}
                >
                  Review Products
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Manage Sellers</CardTitle>
                <CardDescription>Approve and manage seller accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-500 mb-4">
                  {totalSellers}
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/admin/sellers")}
                >
                  Manage Sellers
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Security</CardTitle>
                <CardDescription>Monitor and maintain security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-500 mb-4">
                  <ShieldCheck className="h-10 w-10 mr-3" />
                  <p className="text-xl font-bold">System Secure</p>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/admin/security")}
                >
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => navigate("/admin/products")}
                >
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  <span>Manage Products</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => navigate("/admin/sellers")}
                >
                  <Store className="h-6 w-6 mb-2" />
                  <span>Manage Sellers</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Users</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => navigate("/admin/settings")}
                >
                  <ShieldCheck className="h-6 w-6 mb-2" />
                  <span>Platform Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
