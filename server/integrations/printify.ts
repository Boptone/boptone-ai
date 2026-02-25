/**
 * Printify API Integration
 * 
 * Handles product catalog sync, order forwarding, and fulfillment tracking for Printify POD
 * 
 * API Docs: https://developers.printify.com
 * Base URL: https://api.printify.com/v1
 * Auth: Bearer token in Authorization header
 * 
 * Note: Printify was acquired by Printful in Nov 2024, but APIs remain separate
 */

const PRINTIFY_API_BASE = 'https://api.printify.com/v1';
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

if (!PRINTIFY_API_KEY) {
  console.warn('[Printify] PRINTIFY_API_KEY not set - Printify integration disabled');
}

export interface PrintifyConfig {
  apiToken: string;
  shopId: string;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location: {
    address1: string;
    address2: string | null;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: Record<string, string>; // { size: "M", color: "Black" }
  placeholders: Array<{
    position: string;
    height: number;
    width: number;
  }>;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: Array<{
    name: string;
    type: string;
    values: Array<{
      id: number;
      title: string;
    }>;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    cost: number; // in cents
    price: number; // in cents
    title: string;
    grams: number;
    is_enabled: boolean;
    is_default: boolean;
    is_available: boolean;
    options: number[];
  }>;
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;
      images: Array<{
        id: string;
        name: string;
        type: string;
        height: number;
        width: number;
        x: number;
        y: number;
        scale: number;
        angle: number;
      }>;
    }>;
    background: string;
  }>;
  sales_channel_properties: any[];
}

export interface PrintifyOrderItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyOrderRequest {
  external_id: string; // Boptone order ID
  label?: string;
  line_items: PrintifyOrderItem[];
  shipping_method: number; // 1 = standard
  is_printify_express?: boolean;
  send_shipping_notification?: boolean;
  address_to: PrintifyAddress;
}

export interface PrintifyOrder {
  id: string;
  external_id: string;
  status: 'pending' | 'on-hold' | 'production' | 'shipped' | 'canceled';
  shipping_method: number;
  shipments: Array<{
    carrier: string;
    number: string;
    url: string;
    delivered_at: string | null;
  }>;
  created_at: string;
  sent_to_production_at: string | null;
  fulfilled_at: string | null;
  line_items: Array<{
    product_id: string;
    quantity: number;
    variant_id: number;
    print_provider_id: number;
    cost: number;
    shipping_cost: number;
    status: string;
    metadata: {
      title: string;
      price: number;
      variant_label: string;
      sku: string;
      country: string;
    };
    sent_to_production_at: string | null;
    fulfilled_at: string | null;
  }>;
  address_to: PrintifyAddress;
  total_price: number;
  total_shipping: number;
  total_tax: number;
}

/**
 * Printify API Client
 */
export class PrintifyClient {
  private apiToken: string;
  private shopId: string;

  constructor(config: PrintifyConfig) {
    this.apiToken = config.apiToken;
    this.shopId = config.shopId;
  }

  /**
   * Make authenticated request to Printify API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${PRINTIFY_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [response.statusText] }));
      throw new Error(`Printify API Error (${response.status}): ${error.errors?.[0] || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get shop information
   */
  async getShop() {
    return this.request(`/shops/${this.shopId}.json`, { method: 'GET' });
  }

  /**
   * Get all blueprints (product templates)
   */
  async getBlueprints(): Promise<PrintifyBlueprint[]> {
    return this.request('/catalog/blueprints.json', { method: 'GET' });
  }

  /**
   * Get blueprint details
   */
  async getBlueprint(blueprintId: number): Promise<PrintifyBlueprint> {
    return this.request(`/catalog/blueprints/${blueprintId}.json`, { method: 'GET' });
  }

  /**
   * Get print providers for a blueprint
   */
  async getPrintProviders(blueprintId: number): Promise<PrintifyPrintProvider[]> {
    return this.request(`/catalog/blueprints/${blueprintId}/print_providers.json`, { method: 'GET' });
  }

  /**
   * Get variants for a blueprint and print provider
   */
  async getVariants(blueprintId: number, printProviderId: number): Promise<PrintifyVariant[]> {
    return this.request(
      `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
      { method: 'GET' }
    );
  }

  /**
   * Get shipping rates for print provider
   */
  async getShippingRates(blueprintId: number, printProviderId: number, address: PrintifyAddress) {
    return this.request(
      `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping.json`,
      {
        method: 'POST',
        body: JSON.stringify({ address_to: address }),
      }
    );
  }

  /**
   * Create product in shop
   */
  async createProduct(productData: Partial<PrintifyProduct>): Promise<PrintifyProduct> {
    return this.request(`/shops/${this.shopId}/products.json`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  /**
   * Get all products in shop
   */
  async getProducts(page: number = 1, limit: number = 10): Promise<{ current_page: number; data: PrintifyProduct[]; total: number }> {
    return this.request(`/shops/${this.shopId}/products.json?page=${page}&limit=${limit}`, { method: 'GET' });
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<PrintifyProduct> {
    return this.request(`/shops/${this.shopId}/products/${productId}.json`, { method: 'GET' });
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, productData: Partial<PrintifyProduct>): Promise<PrintifyProduct> {
    return this.request(`/shops/${this.shopId}/products/${productId}.json`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    return this.request(`/shops/${this.shopId}/products/${productId}.json`, { method: 'DELETE' });
  }

  /**
   * Publish product
   */
  async publishProduct(productId: string, publish: boolean = true): Promise<void> {
    return this.request(`/shops/${this.shopId}/products/${productId}/publishing_succeeded.json`, {
      method: 'POST',
      body: JSON.stringify({ external: { id: productId, handle: productId } }),
    });
  }

  /**
   * Create order
   */
  async createOrder(orderData: PrintifyOrderRequest): Promise<PrintifyOrder> {
    return this.request(`/shops/${this.shopId}/orders.json`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<PrintifyOrder> {
    return this.request(`/shops/${this.shopId}/orders/${orderId}.json`, { method: 'GET' });
  }

  /**
   * Get all orders
   */
  async getOrders(page: number = 1, limit: number = 10): Promise<{ current_page: number; data: PrintifyOrder[]; total: number }> {
    return this.request(`/shops/${this.shopId}/orders.json?page=${page}&limit=${limit}`, { method: 'GET' });
  }

  /**
   * Submit order to production
   */
  async submitOrder(orderId: string): Promise<void> {
    return this.request(`/shops/${this.shopId}/orders/${orderId}/send_to_production.json`, { method: 'POST' });
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(orderData: PrintifyOrderRequest) {
    return this.request(`/shops/${this.shopId}/orders/shipping.json`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<void> {
    return this.request(`/shops/${this.shopId}/orders/${orderId}/cancel.json`, { method: 'POST' });
  }

  /**
   * Upload image
   */
  async uploadImage(imageUrl: string, fileName: string): Promise<{ id: string; file_name: string; height: number; width: number; size: number; mime_type: string; preview_url: string; upload_time: string }> {
    return this.request('/uploads/images.json', {
      method: 'POST',
      body: JSON.stringify({
        file_name: fileName,
        url: imageUrl,
      }),
    });
  }

  /**
   * Get uploaded images
   */
  async getImages(page: number = 1, limit: number = 10) {
    return this.request(`/uploads/images.json?page=${page}&limit=${limit}`, { method: 'GET' });
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    return calculatedSignature === signature;
  }
}

/**
 * Create Printify client instance
 */
export function createPrintifyClient(apiToken: string, shopId: string): PrintifyClient {
  return new PrintifyClient({ apiToken, shopId });
}

/**
 * Helper: Get Printify client from environment
 */
export function getPrintifyClient(): PrintifyClient | null {
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    return null;
  }
  return createPrintifyClient(PRINTIFY_API_KEY, PRINTIFY_SHOP_ID);
}
