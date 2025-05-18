import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  shops, type Shop, type InsertShop,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  reviews, type Review, type InsertReview,
  cartItems, type CartItem, type InsertCartItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem
} from "@shared/schema";
import bcrypt from 'bcrypt';

// Define storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  
  // Product methods
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Shop methods
  getShops(): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  getShopBySeller(sellerId: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop | undefined>;
  
  // Order methods
  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // OrderItem methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getSellerOrderItems(sellerId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItemStatus(id: number, status: string): Promise<OrderItem | undefined>;
  
  // Review methods
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Wishlist methods
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<boolean>;
}

// Product filter interface
export interface ProductFilters {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: number;
  status?: string;
  featured?: boolean;
}

// Memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private shops: Map<number, Shop>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentShopId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentReviewId: number;
  private currentCartItemId: number;
  private currentWishlistItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.shops = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentShopId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    this.currentCartItemId = 1;
    this.currentWishlistItemId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    this.createUser({
      username: 'admin',
      password: hashedAdminPassword,
      email: 'admin@ushopls.com',
      phone: '+26622223333',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      address: '123 Admin St',
      city: 'Maseru',
      isSuspended: false,
      isVerified: true
    });
    
    // Create sample categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and gardening' },
      { name: 'Health & Beauty', slug: 'health-beauty', description: 'Beauty products and healthcare items' },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment and apparel' },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment' },
      { name: 'Food & Groceries', slug: 'food-groceries', description: 'Fresh food, groceries, and pantry items' },
      { name: 'Local Cuisine', slug: 'local-cuisine', description: 'Traditional Lesotho and African dishes' },
      { name: 'Restaurants & Takeout', slug: 'restaurants', description: 'Restaurant meals and food delivery' },
      { name: 'Phones & Gadgets', slug: 'phones-gadgets', description: 'Mobile phones, accessories, and tech gadgets' }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.categoryId) {
        products = products.filter(product => product.categoryId === filters.categoryId);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          product.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.minPrice !== undefined) {
        products = products.filter(product => product.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filters.maxPrice!);
      }
      
      if (filters.sellerId) {
        products = products.filter(product => product.sellerId === filters.sellerId);
      }
      
      if (filters.status) {
        products = products.filter(product => product.status === filters.status);
      }
      
      if (filters.featured !== undefined) {
        products = products.filter(product => product.featured === filters.featured);
      }
    }
    
    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.sellerId === sellerId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const timestamp = new Date();
    const product: Product = { ...insertProduct, id, createdAt: timestamp };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Shop methods
  async getShops(): Promise<Shop[]> {
    return Array.from(this.shops.values());
  }

  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopBySeller(sellerId: number): Promise<Shop | undefined> {
    return Array.from(this.shops.values()).find(shop => shop.sellerId === sellerId);
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const id = this.currentShopId++;
    const timestamp = new Date();
    const shop: Shop = { ...insertShop, id, createdAt: timestamp };
    this.shops.set(id, shop);
    return shop;
  }

  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop | undefined> {
    const shop = this.shops.get(id);
    if (!shop) return undefined;
    
    const updatedShop = { ...shop, ...shopData };
    this.shops.set(id, updatedShop);
    return updatedShop;
  }

  // Order methods
  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    return orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const timestamp = new Date();
    const order: Order = { ...insertOrder, id, createdAt: timestamp };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // OrderItem methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async getSellerOrderItems(sellerId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.sellerId === sellerId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const timestamp = new Date();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt: timestamp };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async updateOrderItemStatus(id: number, status: string): Promise<OrderItem | undefined> {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return undefined;
    
    const updatedOrderItem = { ...orderItem, status };
    this.orderItems.set(id, updatedOrderItem);
    return updatedOrderItem;
  }

  // Review methods
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const timestamp = new Date();
    const review: Review = { ...insertReview, id, createdAt: timestamp };
    this.reviews.set(id, review);
    
    // Update product rating
    const product = this.products.get(insertReview.productId);
    if (product) {
      const productReviews = await this.getProductReviews(product.id);
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      this.updateProduct(product.id, {
        rating: averageRating,
        reviewCount: productReviews.length
      });
    }
    
    return review;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if product already in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const timestamp = new Date();
    const cartItem: CartItem = { ...insertCartItem, id, createdAt: timestamp };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    
    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Wishlist methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    // Check if product already in wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      item => item.userId === insertWishlistItem.userId && item.productId === insertWishlistItem.productId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const id = this.currentWishlistItemId++;
    const timestamp = new Date();
    const wishlistItem: WishlistItem = { ...insertWishlistItem, id, createdAt: timestamp };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlistItems.delete(id);
  }
}

export const storage = new MemStorage();
