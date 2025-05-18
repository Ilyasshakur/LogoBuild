import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import Logo from "@/components/common/Logo";
import CategoryMenu from "@/components/layout/CategoryMenu";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  User, 
  ShoppingCart, 
  Heart, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center space-x-2">
                <Logo />
                <span className="text-2xl font-heading font-bold text-primary">UshopLS</span>
            </Link>
            <button 
              className="md:hidden text-neutral-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden md:flex flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search products or shops..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/wishlist" className="text-neutral-600 hover:text-primary font-medium flex items-center">
                <Heart className="h-5 w-5 mr-1" />
                <span>Wishlist</span>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-neutral-600 hover:text-primary font-medium">
                    <User className="h-5 w-5 mr-1" />
                    <span>{user.firstName || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>

                  {user.role === 'seller' && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard" className="w-full cursor-pointer">Seller Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="w-full cursor-pointer">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="text-neutral-600 hover:text-primary font-medium flex items-center">
                <User className="h-5 w-5 mr-1" />
                <span>Account</span>
              </Link>
            )}

            <Link href="/cart" className="relative text-neutral-600 hover:text-primary font-medium flex items-center">
                <ShoppingCart className="h-5 w-5 mr-1" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
            </Link>

            {!user && (
              <Link href="/register" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition duration-200">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search and menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch} className="relative w-full mb-4">
              <Input
                type="text"
                placeholder="Search products or shops..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
            <div className="flex flex-col space-y-3">
              <Link href="/wishlist" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                <span>Wishlist</span>
              </Link>

              {user ? (
                <>
                  <Link href="/account" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      <span>My Account</span>
                  </Link>

                  {user.role === 'seller' && (
                    <Link href="/seller/dashboard" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                        <span>Seller Dashboard</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                        <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Button 
                    variant="ghost" 
                    className="text-red-500 justify-start py-2 h-auto font-medium"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <Link href="/login" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span>Account</span>
                </Link>
              )}

              <Link href="/cart" className="text-neutral-600 hover:text-primary font-medium py-2 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>Cart ({cartItemCount})</span>
              </Link>

              {!user && (
                <Link href="/register" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition duration-200 text-center">
                    Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <CategoryMenu />
    </header>
  );
};

export default Header;