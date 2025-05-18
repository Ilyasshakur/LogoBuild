import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Home,
  ChevronRight,
  CircleOff,
} from "lucide-react";

export default function SellerOrders() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("all");

  // Check if user is authenticated and is a seller
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/seller/orders");
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

  // Get seller's orders
  const { data: sellerOrders, isLoading } = useQuery({
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
    enabled: !!user && isAuthenticated,
  });

  // Update order item status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderItemId, status }: { orderItemId: number; status: string }) => {
      return apiRequest('PUT', `/api/seller/order-items/${orderItemId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/orders'] });
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the order status.",
        variant: "destructive",
      });
    },
  });

  // Filter orders based on tab, search query and status filter
  const getFilteredOrders = () => {
    if (!sellerOrders) return [];
    
    return sellerOrders.filter(order => {
      // Filter by tab
      if (selectedTab === "pending" && order.items.every(item => item.status !== "pending")) {
        return false;
      }
      if (selectedTab === "processing" && order.items.every(item => item.status !== "processing")) {
        return false;
      }
      if (selectedTab === "shipped" && order.items.every(item => item.status !== "shipped")) {
        return false;
      }
      if (selectedTab === "delivered" && order.items.every(item => item.status !== "delivered")) {
        return false;
      }
      if (selectedTab === "cancelled" && order.items.every(item => item.status !== "cancelled")) {
        return false;
      }
      
      // Filter by search (order id or customer name)
      if (searchQuery) {
        const orderIdMatch = order.orderId.toString().includes(searchQuery);
        const customerNameMatch = 
          order.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!orderIdMatch && !customerNameMatch) {
          return false;
        }
      }
      
      // Filter by status
      if (statusFilter && !order.items.some(item => item.status === statusFilter)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Handle order status update
  const handleUpdateStatus = (orderItemId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderItemId, newStatus });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-neutral-500" />;
    }
  };

  if (!isAuthenticated || (user && user.role !== "seller")) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Manage Orders - Seller Dashboard - UshopLS</title>
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-2">
            <Home className="h-4 w-4 mr-2" />
            <Link href="/">
              <a className="text-neutral-500 hover:text-primary text-sm">Home</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
            <Link href="/seller/dashboard">
              <a className="text-neutral-500 hover:text-primary text-sm">Seller Dashboard</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
            <span className="text-sm">Manage Orders</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
                Manage Orders
              </h1>
              <p className="text-neutral-600">
                View and manage customer orders
              </p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input
                    placeholder="Search by order # or customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                All
                <span className="ml-1 text-xs">
                  ({sellerOrders?.length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                <span className="ml-1 text-xs">
                  ({sellerOrders?.filter(o => o.items.some(i => i.status === "pending")).length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger value="processing" className="relative">
                Processing
                <span className="ml-1 text-xs">
                  ({sellerOrders?.filter(o => o.items.some(i => i.status === "processing")).length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger value="shipped" className="relative">
                Shipped
                <span className="ml-1 text-xs">
                  ({sellerOrders?.filter(o => o.items.some(i => i.status === "shipped")).length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger value="delivered" className="relative">
                Delivered
                <span className="ml-1 text-xs">
                  ({sellerOrders?.filter(o => o.items.some(i => i.status === "delivered")).length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="relative">
                Cancelled
                <span className="ml-1 text-xs">
                  ({sellerOrders?.filter(o => o.items.some(i => i.status === "cancelled")).length || 0})
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
            <TabsContent value="processing" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
            <TabsContent value="shipped" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
            <TabsContent value="delivered" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
            <TabsContent value="cancelled" className="mt-6">
              {renderOrdersList()}
            </TabsContent>
          </Tabs>
          
          {/* Order details dialog */}
          <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder?.orderId}</DialogTitle>
                <DialogDescription>
                  Placed on {selectedOrder && new Date(selectedOrder.orderDate).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Customer Information
                      </h3>
                      <div className="text-sm bg-neutral-50 p-3 rounded-md">
                        <p><span className="font-medium">Name:</span> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Order Summary
                      </h3>
                      <div className="text-sm bg-neutral-50 p-3 rounded-md">
                        <p><span className="font-medium">Order ID:</span> #{selectedOrder.orderId}</p>
                        <p><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                        <p><span className="font-medium">Items:</span> {selectedOrder.items.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Items</h3>
                    <div className="bg-neutral-50 rounded-md">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="p-4 border-b border-neutral-200 last:border-0">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="md:w-16 h-16 bg-neutral-100 rounded-md overflow-hidden mr-4 mb-4 md:mb-0">
                              {item.product && item.product.images && item.product.images.length > 0 ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                  <Package className="h-5 w-5 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <h4 className="font-medium">{item.product?.name}</h4>
                              <div className="text-sm text-neutral-600">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>Price: M {item.price.toLocaleString()}</span>
                                  <span>Total: M {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-4">
                              <div className="flex items-center">
                                {getStatusIcon(item.status)}
                                <span className="ml-2 font-medium capitalize">{item.status}</span>
                              </div>
                              
                              <Select
                                value={item.status}
                                onValueChange={(value) => handleUpdateStatus(item.id, value)}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                <SelectTrigger className="mt-2 h-8">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );

  function renderOrdersList() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-grow">
                    <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
                  </div>
                  <div className="w-24 h-8 bg-neutral-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (!filteredOrders.length) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            
            {sellerOrders && sellerOrders.length > 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">No orders match your filters</h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("");
                    setSelectedTab("all");
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-neutral-600">
                  You haven't received any orders yet.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredOrders.map((order: any) => (
          <Card key={order.orderId}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                    <h3 className="font-medium">Order #{order.orderId}</h3>
                    <span className="text-sm text-neutral-500">
                      {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2">
                    <div>
                      <span className="text-neutral-500">Customer: </span>
                      <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Items: </span>
                      <span>{order.items.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center text-xs px-2 py-1 rounded-full bg-neutral-100">
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="mt-4 md:mt-0"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
