import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { 
  insertUserSchema, loginSchema, insertProductSchema, insertShopSchema,
  insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema,
  insertWishlistItemSchema
} from '@shared/schema';
import { z } from 'zod';

// JWT secret key - normally would be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'ushopls-secret-key';

// Auth middleware
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden. Insufficient permissions.' });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Set default role to buyer if not specified
      if (!userData.role) {
        userData.role = 'buyer';
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
      
      // Check if user is suspended
      if (user.isSuspended) {
        return res.status(403).json({ message: 'Your account has been suspended.' });
      }
      
      // Compare passwords
      const validPassword = await bcrypt.compare(credentials.password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/categories/:id', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/categories/slug/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sellerId: req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined,
        status: req.query.status as string,
        featured: req.query.featured === 'true'
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/products/slug/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/products/seller/:sellerId', authenticateToken, async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      
      // Check if user is requesting their own products or is an admin
      if (req.user.id !== sellerId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden.' });
      }
      
      const products = await storage.getProductsBySeller(sellerId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/products', authenticateToken, authorize(['seller', 'admin']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // If user is a seller, ensure they can only create products for themselves
      if (req.user.role === 'seller' && productData.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only create products for your own shop.' });
      }
      
      // Set initial status based on role
      productData.status = req.user.role === 'admin' ? 'approved' : 'pending';
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/products/:id', authenticateToken, authorize(['seller', 'admin']), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      // If user is a seller, ensure they can only update their own products
      if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own products.' });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Prevent sellers from changing approved status
      if (req.user.role === 'seller' && productData.status && productData.status !== product.status) {
        delete productData.status;
      }
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/products/:id', authenticateToken, authorize(['seller', 'admin']), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      // If user is a seller, ensure they can only delete their own products
      if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own products.' });
      }
      
      await storage.deleteProduct(productId);
      res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Shops routes
  app.get('/api/shops', async (req, res) => {
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/shops/:id', async (req, res) => {
    try {
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShop(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found.' });
      }
      
      res.json(shop);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/shops/seller/:sellerId', async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const shop = await storage.getShopBySeller(sellerId);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found.' });
      }
      
      res.json(shop);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/shops', authenticateToken, authorize(['seller']), async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      
      // Ensure seller can only create shop for themselves
      if (shopData.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only create a shop for yourself.' });
      }
      
      // Check if seller already has a shop
      const existingShop = await storage.getShopBySeller(req.user.id);
      if (existingShop) {
        return res.status(400).json({ message: 'You already have a shop.' });
      }
      
      const shop = await storage.createShop(shopData);
      res.status(201).json(shop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/shops/:id', authenticateToken, authorize(['seller', 'admin']), async (req, res) => {
    try {
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShop(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found.' });
      }
      
      // If user is a seller, ensure they can only update their own shop
      if (req.user.role === 'seller' && shop.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own shop.' });
      }
      
      const shopData = insertShopSchema.partial().parse(req.body);
      
      // Prevent changing shop owner
      delete shopData.sellerId;
      
      // Only admin can change verification status
      if (req.user.role !== 'admin') {
        delete shopData.isVerified;
      }
      
      const updatedShop = await storage.updateShop(shopId, shopData);
      res.json(updatedShop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Cart routes
  app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      
      // Fetch product details for each cart item
      const cartWithProducts = await Promise.all(cartItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      
      // Ensure user can only add to their own cart
      if (cartItemData.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only add items to your own cart.' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      // Check if product is approved
      if (product.status !== 'approved') {
        return res.status(400).json({ message: 'This product is not available for purchase.' });
      }
      
      // Check if quantity is valid
      if (cartItemData.quantity > product.stock) {
        return res.status(400).json({ message: 'Not enough stock available.' });
      }
      
      const cartItem = await storage.addToCart(cartItemData);
      
      // Include product details in response
      const cartItemWithProduct = {
        ...cartItem,
        product
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1.' });
      }
      
      const cartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found.' });
      }
      
      // Ensure user can only update their own cart
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update items in your own cart.' });
      }
      
      // Check if quantity is valid
      const product = await storage.getProduct(cartItem.productId);
      if (quantity > product!.stock) {
        return res.status(400).json({ message: 'Not enough stock available.' });
      }
      
      // Include product details in response
      const cartItemWithProduct = {
        ...cartItem,
        product
      };
      
      res.json(cartItemWithProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.cartItems.get(cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found.' });
      }
      
      // Ensure user can only remove from their own cart
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only remove items from your own cart.' });
      }
      
      await storage.removeFromCart(cartItemId);
      res.json({ message: 'Item removed from cart.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: 'Cart cleared successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Orders routes
  app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
      let orders;
      
      // Admin can see all orders, users can only see their own
      if (req.user.role === 'admin') {
        orders = await storage.getOrders();
      } else {
        orders = await storage.getOrders(req.user.id);
      }
      
      // For each order, get order items
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return {
          ...order,
          items
        };
      }));
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.get('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      
      // Ensure user can only view their own orders (unless admin)
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only view your own orders.' });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      res.json({
        ...order,
        items
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Ensure user can only create orders for themselves
      if (orderData.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only create orders for yourself.' });
      }
      
      // Get cart items to create order items
      const cartItems = await storage.getCartItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty.' });
      }
      
      // Validate stock for all items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found.` });
        }
        
        if (item.quantity > product.stock) {
          return res.status(400).json({
            message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}.`
          });
        }
      }
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product!.price,
          sellerId: product!.sellerId,
          status: 'pending'
        });
        
        // Update product stock
        await storage.updateProduct(item.productId, {
          stock: product!.stock - item.quantity
        });
      }
      
      // Clear the cart
      await storage.clearCart(req.user.id);
      
      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/orders/:id/status', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Seller order management
  app.get('/api/seller/orders', authenticateToken, authorize(['seller']), async (req, res) => {
    try {
      const orderItems = await storage.getSellerOrderItems(req.user.id);
      
      // Group order items by order ID
      const orderMap = new Map();
      
      for (const item of orderItems) {
        const order = await storage.getOrder(item.orderId);
        const product = await storage.getProduct(item.productId);
        
        if (!orderMap.has(item.orderId)) {
          orderMap.set(item.orderId, {
            orderId: item.orderId,
            orderDate: order!.createdAt,
            customer: await storage.getUser(order!.userId),
            status: order!.status,
            items: []
          });
        }
        
        orderMap.get(item.orderId).items.push({
          ...item,
          product
        });
      }
      
      res.json(Array.from(orderMap.values()));
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/seller/order-items/:id/status', authenticateToken, authorize(['seller']), async (req, res) => {
    try {
      const orderItemId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
      }
      
      const orderItem = await storage.orderItems.get(orderItemId);
      
      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found.' });
      }
      
      // Ensure seller can only update their own order items
      if (orderItem.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own order items.' });
      }
      
      const updatedOrderItem = await storage.updateOrderItemStatus(orderItemId, status);
      res.json(updatedOrderItem);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Wishlist routes
  app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
      const wishlistItems = await storage.getWishlistItems(req.user.id);
      
      // Fetch product details for each wishlist item
      const wishlistWithProducts = await Promise.all(wishlistItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(wishlistWithProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/wishlist', authenticateToken, async (req, res) => {
    try {
      const wishlistItemData = insertWishlistItemSchema.parse(req.body);
      
      // Ensure user can only add to their own wishlist
      if (wishlistItemData.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only add items to your own wishlist.' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(wishlistItemData.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      
      // Include product details in response
      const wishlistItemWithProduct = {
        ...wishlistItem,
        product
      };
      
      res.status(201).json(wishlistItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/wishlist/:id', authenticateToken, async (req, res) => {
    try {
      const wishlistItemId = parseInt(req.params.id);
      const wishlistItem = await storage.wishlistItems.get(wishlistItemId);
      
      if (!wishlistItem) {
        return res.status(404).json({ message: 'Wishlist item not found.' });
      }
      
      // Ensure user can only remove from their own wishlist
      if (wishlistItem.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only remove items from your own wishlist.' });
      }
      
      await storage.removeFromWishlist(wishlistItemId);
      res.json({ message: 'Item removed from wishlist.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Reviews routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      const reviews = await storage.getProductReviews(productId);
      
      // Get user details for each review
      const reviewsWithUsers = await Promise.all(reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          user: {
            id: user!.id,
            username: user!.username,
            firstName: user!.firstName,
            lastName: user!.lastName,
            avatar: user!.avatar
          }
        };
      }));
      
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Ensure user can only add reviews for themselves
      if (reviewData.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only add reviews as yourself.' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(reviewData.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      
      // TODO: Check if user has purchased the product
      
      const review = await storage.createReview(reviewData);
      
      // Get user details
      const user = await storage.getUser(review.userId);
      
      const reviewWithUser = {
        ...review,
        user: {
          id: user!.id,
          username: user!.username,
          firstName: user!.firstName,
          lastName: user!.lastName,
          avatar: user!.avatar
        }
      };
      
      res.status(201).json(reviewWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
