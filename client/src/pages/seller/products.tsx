import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Home,
  ChevronRight,
} from "lucide-react";

export default function SellerProducts() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Check if user is authenticated and is a seller
  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      navigate("/login?redirect=/seller/products");
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

  // Get seller's products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/seller/' + user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/products/seller/' + user.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<Product[]>;
    },
    enabled: !!user && isAuthenticated,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products/seller/' + user?.id] });
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "There was an error deleting the product.",
        variant: "destructive",
      });
    },
  });

  // Filter products based on search query and status filter
  const filteredProducts = products?.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "" || product.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle product deletion
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  if (!isAuthenticated || (user && user.role !== "seller")) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Manage Products - Seller Dashboard - UshopLS</title>
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
            <span className="text-sm">Manage Products</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
                Manage Products
              </h1>
              <p className="text-neutral-600">
                Manage and update your product listings
              </p>
            </div>
            
            <Button 
              className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark"
              onClick={() => navigate("/seller/products/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-neutral-200 rounded-md mr-4"></div>
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
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                      <div className="w-full md:w-16 h-16 bg-neutral-100 rounded-md overflow-hidden mr-0 md:mr-4 mb-4 md:mb-0">
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
                      
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-2">
                          <div>
                            <span className="text-neutral-500">Price:</span>{" "}
                            <span className="font-medium">M {product.price.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Stock:</span>{" "}
                            <span className={`font-medium ${product.stock <= 5 ? "text-red-500" : ""}`}>
                              {product.stock}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Status:</span>{" "}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.status === "approved" ? "bg-green-100 text-green-800" : 
                              product.status === "pending" ? "bg-amber-100 text-amber-800" :
                              product.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-neutral-100 text-neutral-800"
                            }`}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-4 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => navigate(`/products/${product.slug}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/seller/products/edit/${product.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                
                {products && products.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No products match your filters</h3>
                    <p className="text-neutral-600 mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delete confirmation dialog */}
          <AlertDialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-medium">{selectedProduct?.name}</span> from your shop.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteProductMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
