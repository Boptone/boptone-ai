import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as ecommerceDb from "./ecommerceDb";
import * as db from "./db";

/**
 * E-COMMERCE TRPC ROUTER
 * Comprehensive Shopify-level e-commerce system
 */

export const ecommerceRouter = router({
  // ============================================================================
  // PRODUCTS
  // ============================================================================
  
  products: router({
    // Create product
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["physical", "digital", "experience"]),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().int(), // in cents
        compareAtPrice: z.number().int().optional(),
        sku: z.string().optional(),
        inventoryQuantity: z.number().int().default(0),
        trackInventory: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        digitalFileUrl: z.string().optional(),
        digitalFileSize: z.number().int().optional(),
        downloadLimit: z.number().int().optional(),
        eventDate: z.date().optional(),
        eventLocation: z.string().optional(),
        maxAttendees: z.number().int().optional(),
        images: z.array(z.object({
          url: z.string(),
          alt: z.string().optional(),
          position: z.number().int(),
        })).optional(),
        primaryImageUrl: z.string().optional(),
        slug: z.string().min(1),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
        requiresShipping: z.boolean().default(false),
        weight: z.string().optional(), // Decimal as string
        status: z.enum(["draft", "active", "archived"]).default("draft"),
        featured: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Artist profile not found");
        
        return await ecommerceDb.createProduct({
          ...input,
          artistId: profile.id,
        });
      }),
    
    // Get product by ID
    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getProductById(input.id);
      }),
    
    // Get product by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getProductBySlug(input.slug);
      }),
    
    // Get products by artist
    getByArtist: publicProcedure
      .input(z.object({
        artistId: z.number().int(),
        status: z.enum(["draft", "active", "archived"]).optional(),
      }))
      .query(async ({ input }) => {
        return await ecommerceDb.getProductsByArtist(input.artistId, input.status);
      }),
    
    // Get my products (artist)
    getMy: protectedProcedure
      .input(z.object({
        status: z.enum(["draft", "active", "archived"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) return [];
        
        return await ecommerceDb.getProductsByArtist(profile.id, input.status);
      }),
    
    // Get all active products (shop page)
    getAllActive: publicProcedure
      .input(z.object({
        limit: z.number().int().default(50),
      }))
      .query(async ({ input }) => {
        return await ecommerceDb.getAllActiveProducts(input.limit);
      }),
    
    // Update product
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        type: z.enum(["physical", "digital", "experience"]).optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().int().optional(),
        compareAtPrice: z.number().int().optional(),
        sku: z.string().optional(),
        inventoryQuantity: z.number().int().optional(),
        trackInventory: z.boolean().optional(),
        allowBackorder: z.boolean().optional(),
        digitalFileUrl: z.string().optional(),
        digitalFileSize: z.number().int().optional(),
        downloadLimit: z.number().int().optional(),
        eventDate: z.date().optional(),
        eventLocation: z.string().optional(),
        maxAttendees: z.number().int().optional(),
        images: z.array(z.object({
          url: z.string(),
          alt: z.string().optional(),
          position: z.number().int(),
        })).optional(),
        primaryImageUrl: z.string().optional(),
        slug: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
        requiresShipping: z.boolean().optional(),
        weight: z.string().optional(), // Decimal as string
        status: z.enum(["draft", "active", "archived"]).optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await ecommerceDb.updateProduct(id, updates);
        return { success: true };
      }),
    
    // Delete product
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await ecommerceDb.deleteProduct(input.id);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // PRODUCT VARIANTS
  // ============================================================================
  
  variants: router({
    // Create variant
    create: protectedProcedure
      .input(z.object({
        productId: z.number().int(),
        name: z.string(),
        sku: z.string().optional(),
        price: z.number().int().optional(),
        compareAtPrice: z.number().int().optional(),
        option1: z.string().optional(),
        option2: z.string().optional(),
        option3: z.string().optional(),
        inventoryQuantity: z.number().int().default(0),
        imageUrl: z.string().optional(),
        available: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await ecommerceDb.createProductVariant(input);
      }),
    
    // Get variants by product
    getByProduct: publicProcedure
      .input(z.object({ productId: z.number().int() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getVariantsByProduct(input.productId);
      }),
    
    // Update variant
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.number().int().optional(),
        compareAtPrice: z.number().int().optional(),
        option1: z.string().optional(),
        option2: z.string().optional(),
        option3: z.string().optional(),
        inventoryQuantity: z.number().int().optional(),
        imageUrl: z.string().optional(),
        available: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await ecommerceDb.updateVariant(id, updates);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // SHOPPING CART
  // ============================================================================
  
  cart: router({
    // Add to cart
    add: protectedProcedure
      .input(z.object({
        productId: z.number().int(),
        variantId: z.number().int().optional(),
        quantity: z.number().int().default(1),
        priceAtAdd: z.number().int(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ecommerceDb.addToCart({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    // Get my cart
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return await ecommerceDb.getCartByUser(ctx.user.id);
      }),
    
    // Update cart item
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        quantity: z.number().int(),
      }))
      .mutation(async ({ input }) => {
        await ecommerceDb.updateCartItem(input.id, input.quantity);
        return { success: true };
      }),
    
    // Remove from cart
    remove: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await ecommerceDb.removeFromCart(input.id);
        return { success: true };
      }),
    
    // Clear cart
    clear: protectedProcedure
      .mutation(async ({ ctx }) => {
        await ecommerceDb.clearCart(ctx.user.id);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // ORDERS
  // ============================================================================
  
  orders: router({
    // Create order
    create: protectedProcedure
      .input(z.object({
        artistId: z.number().int(),
        subtotal: z.number().int(),
        taxAmount: z.number().int().default(0),
        shippingAmount: z.number().int().default(0),
        discountAmount: z.number().int().default(0),
        total: z.number().int(),
        shippingAddress: z.object({
          name: z.string(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
          phone: z.string().optional(),
        }),
        billingAddress: z.object({
          name: z.string(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
        }),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        customerNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderNumber = ecommerceDb.generateOrderNumber();
        
        return await ecommerceDb.createOrder({
          orderNumber,
          customerId: ctx.user.id,
          ...input,
        });
      }),
    
    // Get order by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getOrderById(input.id);
      }),
    
    // Get order by number
    getByNumber: protectedProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getOrderByNumber(input.orderNumber);
      }),
    
    // Get my orders (customer)
    getMy: protectedProcedure
      .query(async ({ ctx }) => {
        return await ecommerceDb.getOrdersByCustomer(ctx.user.id);
      }),
    
    // Get orders by artist (seller)
    getByArtist: protectedProcedure
      .input(z.object({
        fulfillmentStatus: z.enum(["unfulfilled", "partial", "fulfilled", "cancelled"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) return [];
        
        return await ecommerceDb.getOrdersByArtist(profile.id, input.fulfillmentStatus);
      }),
    
    // Update order
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "partially_refunded"]).optional(),
        fulfillmentStatus: z.enum(["unfulfilled", "partial", "fulfilled", "cancelled"]).optional(),
        shippingMethod: z.string().optional(),
        trackingNumber: z.string().optional(),
        trackingUrl: z.string().optional(),
        internalNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await ecommerceDb.updateOrder(id, updates);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // ORDER ITEMS
  // ============================================================================
  
  orderItems: router({
    // Create order item
    create: protectedProcedure
      .input(z.object({
        orderId: z.number().int(),
        productId: z.number().int(),
        variantId: z.number().int().optional(),
        productName: z.string(),
        variantName: z.string().optional(),
        productType: z.enum(["physical", "digital", "experience"]),
        sku: z.string().optional(),
        quantity: z.number().int(),
        pricePerUnit: z.number().int(),
        subtotal: z.number().int(),
        taxAmount: z.number().int().default(0),
        total: z.number().int(),
        digitalFileUrl: z.string().optional(),
        downloadLimit: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        return await ecommerceDb.createOrderItem(input);
      }),
    
    // Get order items by order
    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number().int() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getOrderItemsByOrder(input.orderId);
      }),
    
    // Update order item
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        fulfillmentStatus: z.enum(["unfulfilled", "fulfilled", "cancelled"]).optional(),
        downloadCount: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await ecommerceDb.updateOrderItem(id, updates);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // SHIPPING RATES
  // ============================================================================
  
  shippingRates: router({
    // Create shipping rate
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().int(),
        freeShippingThreshold: z.number().int().optional(),
        minOrderAmount: z.number().int().optional(),
        maxOrderAmount: z.number().int().optional(),
        countries: z.array(z.string()).optional(),
        minDeliveryDays: z.number().int().optional(),
        maxDeliveryDays: z.number().int().optional(),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Artist profile not found");
        
        return await ecommerceDb.createShippingRate({
          ...input,
          artistId: profile.id,
        });
      }),
    
    // Get shipping rates by artist
    getByArtist: publicProcedure
      .input(z.object({ artistId: z.number().int() }))
      .query(async ({ input }) => {
        return await ecommerceDb.getShippingRatesByArtist(input.artistId);
      }),
  }),
  
  // ============================================================================
  // DISCOUNT CODES
  // ============================================================================
  
  discountCodes: router({
    // Create discount code
    create: protectedProcedure
      .input(z.object({
        code: z.string().min(1).max(50),
        type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
        value: z.number().int(),
        minPurchaseAmount: z.number().int().optional(),
        maxUses: z.number().int().optional(),
        maxUsesPerCustomer: z.number().int().default(1),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        active: z.boolean().default(true),
        appliesToAllProducts: z.boolean().default(true),
        productIds: z.array(z.number().int()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Artist profile not found");
        
        return await ecommerceDb.createDiscountCode({
          ...input,
          code: input.code.toUpperCase(),
          artistId: profile.id,
        });
      }),
    
    // Validate discount code
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const discount = await ecommerceDb.getDiscountCodeByCode(input.code);
        
        if (!discount) {
          return { valid: false, message: "Invalid discount code" };
        }
        
        if (!discount.active) {
          return { valid: false, message: "Discount code is inactive" };
        }
        
        const now = new Date();
        if (discount.startsAt && now < discount.startsAt) {
          return { valid: false, message: "Discount code not yet active" };
        }
        
        if (discount.expiresAt && now > discount.expiresAt) {
          return { valid: false, message: "Discount code has expired" };
        }
        
        if (discount.maxUses && discount.usageCount >= discount.maxUses) {
          return { valid: false, message: "Discount code usage limit reached" };
        }
        
        return { valid: true, discount };
      }),
    
    // Get discount codes by artist
    getMy: protectedProcedure
      .query(async ({ ctx }) => {
        const profile = await db.getArtistProfileByUserId(ctx.user.id);
        if (!profile) return [];
        
        return await ecommerceDb.getDiscountCodesByArtist(profile.id);
      }),
    
    // Update discount code
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        active: z.boolean().optional(),
        maxUses: z.number().int().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await ecommerceDb.updateDiscountCode(id, updates);
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // PRODUCT REVIEWS
  // ============================================================================
  
  reviews: router({
    // Create review
    create: protectedProcedure
      .input(z.object({
        productId: z.number().int(),
        orderId: z.number().int().optional(),
        rating: z.number().int().min(1).max(5),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ecommerceDb.createProductReview({
          ...input,
          userId: ctx.user.id,
        });
      }),
    
    // Get reviews by product
    getByProduct: publicProcedure
      .input(z.object({
        productId: z.number().int(),
        status: z.enum(["pending", "approved", "rejected"]).default("approved"),
      }))
      .query(async ({ input }) => {
        return await ecommerceDb.getReviewsByProduct(input.productId, input.status);
      }),
  }),
});
