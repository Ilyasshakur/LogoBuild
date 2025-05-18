import { useEffect } from "react";
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
  Users,
  ShoppingBag,
  Store,
  TrendingUp,
  ShieldCheck,
  Home,
  ChevronRight,
  Truck,
  Mail,
  Settings,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

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

    if (user?.email !== "admin@ushopls.co.ls" || user?.role !== "admin") {
      navigate("/account");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user]);

  // Mock data for now - will be replaced with real API data
  const salesData = [
    { month: "Jan", sales: 24000, commissions: 2400 },
    { month: "Feb", sales: 13980, commissions: 1398 },
    { month: "Mar", sales: 98000, commissions: 9800 },
    { month: "Apr", sales: 39080, commissions: 3908 },
    { month: "May", sales: 48000, commissions: 4800 },
    { month: "Jun", sales: 38000, commissions: 3800 },
  ];

  const commissionBreakdown = [
    { name: "Buyer Commission (4%)", value: 4500, color: "#0F4C81" },
    { name: "Seller Commission (3%)", value: 3200, color: "#4CAF50" },
    { name: "Delivery Commission (3%)", value: 2800, color: "#FF9800" },
  ];

  const deliveryStats = [
    { name: "Pending", value: 45, color: "#FF9800" },
    { name: "Shipped", value: 32, color: "#2196F3" },
    { name: "Delivered", value: 78, color: "#4CAF50" },
  ];

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
          { id: 1, status: 'delivered', total: 24000 },
          { id: 2, status: 'processing', total: 59990 },
          { id: 3, status: 'shipped', total: 12990 },
          { id: 4, status: 'pending', total: 8990 },
          { id: 5, status: 'delivered', total: 129990 },
          { id: 6, status: 'cancelled', total: 34990 },
        ];
      },
      enabled: !!user && isAuthenticated && user.role === 'admin',
    });

  // Calculate summary stats
  const totalUsers = users?.length || 0;
  const totalSellers = users?.filter(u => u.role === 'seller').length || 0;
  const totalProducts = products?.length || 0;
  const pendingProducts = products?.filter(p => p.status === 'pending').length || 0;

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

      <div className="bg-neutral-100 min-h-screen py-8">
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
                Manage and monitor UshopLS marketplace
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
                    <h3 className="text-2xl font-bold">M 261,060</h3>
                    <p className="text-sm text-green-600">M 10,500 commissions</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Users</p>
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
                    <p className="text-sm font-medium text-neutral-500">Products</p>
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
                    <p className="text-sm font-medium text-neutral-500">Deliveries</p>
                    <h3 className="text-2xl font-bold">155</h3>
                    <p className="text-sm text-purple-600">45 Pending</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue & Commissions</CardTitle>
              <CardDescription>Monthly sales and commission breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#0F4C81"
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="commissions" 
                      stroke="#4CAF50"
                      fillOpacity={1} 
                      fill="url(#colorCommissions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Commission Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
                <CardDescription>Distribution of commission sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {commissionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>Current delivery statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deliveryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deliveryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
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
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Users</span>
                </Button>

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
                  onClick={() => navigate("/admin/settings")}
                >
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Commission Settings</span>
                </Button>

                <Button 
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => navigate("/admin/support")}
                >
                  <Mail className="h-6 w-6 mb-2" />
                  <span>Support Inquiries</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}