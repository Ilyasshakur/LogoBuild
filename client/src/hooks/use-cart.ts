import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartStore {
  cartItems: CartItem[];
  isLoading: boolean;
  addItem: (productId: number, quantity: number, product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
}

// Create local cart store
const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartItems: [],
      isLoading: false,
      addItem: (productId, quantity, product) => 
        set((state) => {
          // Check if item already exists in cart
          const existingItemIndex = state.cartItems.findIndex(
            (item) => item.productId === productId
          );
          
          if (existingItemIndex !== -1) {
            // Update quantity if item exists
            const updatedItems = [...state.cartItems];
            updatedItems[existingItemIndex].quantity += quantity;
            return { cartItems: updatedItems };
          }
          
          // Add new item
          const newItem = {
            id: Date.now(),
            productId,
            quantity,
            product
          };
          return { cartItems: [...state.cartItems, newItem] };
        }),
      removeItem: (id) => 
        set((state) => ({ 
          cartItems: state.cartItems.filter((item) => item.id !== id) 
        })),
      updateQuantity: (id, quantity) => 
        set((state) => {
          const updatedItems = state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          return { cartItems: updatedItems };
        }),
      clearCart: () => set({ cartItems: [] }),
      setCartItems: (items) => set({ cartItems: items }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ushopls-cart',
    }
  )
);

// Hook for using cart with auth integration
export const useCart = () => {
  const { cartItems, isLoading, addItem, removeItem, updateQuantity, clearCart, setCartItems, setLoading } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  
  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );
  
  // Sync cart with backend when authenticated
  const syncCartWithBackend = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      
      // Fetch cart from backend
      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      throw new Error('Not enough stock available');
    }
    
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        
        // Add to backend cart
        await apiRequest('POST', '/api/cart', {
          userId: user.id,
          productId: product.id,
          quantity,
        });
        
        // Refetch cart items
        await syncCartWithBackend();
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Add to local cart
      addItem(product.id, quantity, product);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (id: number) => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        
        // Remove from backend cart
        await apiRequest('DELETE', `/api/cart/${id}`, undefined);
        
        // Refetch cart items
        await syncCartWithBackend();
      } catch (error) {
        console.error('Failed to remove item from cart:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Remove from local cart
      removeItem(id);
    }
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = async (id: number, quantity: number) => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        
        // Update in backend cart
        await apiRequest('PUT', `/api/cart/${id}`, { quantity });
        
        // Refetch cart items
        await syncCartWithBackend();
      } catch (error) {
        console.error('Failed to update cart item:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Update in local cart
      updateQuantity(id, quantity);
    }
  };
  
  // Clear cart
  const emptyCart = async () => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        
        // Clear backend cart
        await apiRequest('DELETE', '/api/cart', undefined);
        
        // Clear local cart
        clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Clear local cart
      clearCart();
    }
  };
  
  return {
    cartItems,
    isLoading,
    totalPrice,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart: emptyCart,
    syncCartWithBackend,
  };
};
