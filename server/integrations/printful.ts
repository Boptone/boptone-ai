/**
 * Printful API Client
 * 
 * Official API Documentation: https://developers.printful.com/docs/
 * 
 * This client handles:
 * - Authentication (API token)
 * - Product catalog browsing
 * - Order creation and submission
 * - Mockup generation
 * - Webhook event handling
 */

const PRINTFUL_API_BASE = 'https://api.printful.com';

export interface PrintfulConfig {
  apiToken: string;
  storeId?: string;
}

export interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  title: string;
  brand: string | null;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  files: Array<{
    id: string;
    type: string;
    title: string;
    additional_price: string | null;
  }>;
  options: Array<{
    id: string;
    title: string;
    type: string;
    values: Record<string, string>;
    additional_price: string | null;
  }>;
  dimensions: {
    width: string;
    height: string;
  } | null;
  is_discontinued: boolean;
  avg_fulfillment_time: number | null;
  techniques: Array<{
    key: string;
    display_name: string;
    is_default: boolean;
  }>;
  description: string;
}

export interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  color_code2: string | null;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: Record<string, string>;
  availability_status: Array<{
    region: string;
    status: string;
  }>;
  material: Array<{
    name: string;
    percentage: number;
  }>;
}

export interface PrintfulOrderItem {
  variant_id: number;
  quantity: number;
  retail_price: string; // e.g., "29.99"
  name?: string;
  files?: Array<{
    url: string;
    type?: 'default' | 'back' | 'left' | 'right' | 'sleeve_left' | 'sleeve_right';
    options?: Array<{
      id: string;
      value: any;
    }>;
  }>;
}

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface PrintfulOrderRequest {
  external_id: string; // Boptone order ID
  shipping: 'STANDARD' | 'FAST' | 'PRIORITY';
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retail_costs?: {
    currency: string;
    subtotal: string;
    discount?: string;
    shipping?: string;
    tax?: string;
  };
  gift?: {
    subject: string;
    message: string;
  };
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  status: 'draft' | 'pending' | 'failed' | 'canceled' | 'onhold' | 'inprocess' | 'partial' | 'fulfilled';
  shipping: string;
  created: number;
  updated: number;
  recipient: PrintfulRecipient;
  items: Array<{
    id: number;
    external_id: string | null;
    variant_id: number;
    sync_variant_id: number | null;
    external_variant_id: string | null;
    quantity: number;
    price: string;
    retail_price: string;
    name: string;
    product: {
      variant_id: number;
      product_id: number;
      image: string;
      name: string;
    };
    files: Array<{
      id: number;
      type: string;
      hash: string | null;
      url: string | null;
      filename: string;
      mime_type: string;
      size: number;
      width: number;
      height: number;
      dpi: number | null;
      status: string;
      created: number;
      thumbnail_url: string | null;
      preview_url: string | null;
      visible: boolean;
    }>;
    options: Array<{
      id: string;
      value: any;
    }>;
    sku: string | null;
    discontinued: boolean;
    out_of_stock: boolean;
  }>;
  costs: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    digitization: string;
    additional_fee: string;
    fulfillment_fee: string;
    retail_delivery_fee: string;
    tax: string;
    vat: string;
    total: string;
  };
  retail_costs: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
    total: string;
  };
  shipments: Array<{
    id: number;
    carrier: string;
    service: string;
    tracking_number: string;
    tracking_url: string;
    created: number;
    ship_date: string;
    shipped_at: number;
    reshipment: boolean;
    items: Array<{
      item_id: number;
      quantity: number;
      picked: number;
      printed: number;
    }>;
  }>;
}

export interface PrintfulMockupRequest {
  variant_ids: number[];
  format?: 'jpg' | 'png';
  files?: Array<{
    placement: string;
    image_url: string;
    position?: {
      area_width: number;
      area_height: number;
      width: number;
      height: number;
      top: number;
      left: number;
    };
  }>;
}

export interface PrintfulMockup {
  variant_ids: number[];
  placement: string;
  mockup_url: string;
  extra: Array<{
    title: string;
    option: string;
    url: string;
  }>;
}

/**
 * Printful API Client
 */
export class PrintfulClient {
  private apiToken: string;
  private storeId?: string;

  constructor(config: PrintfulConfig) {
    this.apiToken = config.apiToken;
    this.storeId = config.storeId;
  }

  /**
   * Make authenticated request to Printful API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ code: number; result: T; extra?: any }> {
    const url = `${PRINTFUL_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': this.storeId || '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Printful API Error (${response.status}): ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get store information
   */
  async getStoreInfo() {
    return this.request('/store', { method: 'GET' });
  }

  /**
   * Get all products in catalog
   */
  async getProducts(): Promise<PrintfulProduct[]> {
    const response = await this.request<PrintfulProduct[]>('/products', { method: 'GET' });
    return response.result;
  }

  /**
   * Get product details by ID
   */
  async getProduct(productId: number): Promise<PrintfulProduct> {
    const response = await this.request<{ product: PrintfulProduct; variants: PrintfulVariant[] }>(
      `/products/${productId}`,
      { method: 'GET' }
    );
    return response.result.product;
  }

  /**
   * Get product variants
   */
  async getProductVariants(productId: number): Promise<PrintfulVariant[]> {
    const response = await this.request<{ product: PrintfulProduct; variants: PrintfulVariant[] }>(
      `/products/${productId}`,
      { method: 'GET' }
    );
    return response.result.variants;
  }

  /**
   * Get variant details by ID
   */
  async getVariant(variantId: number): Promise<PrintfulVariant> {
    const response = await this.request<{ variant: PrintfulVariant; product: PrintfulProduct }>(
      `/products/variant/${variantId}`,
      { method: 'GET' }
    );
    return response.result.variant;
  }

  /**
   * Create order estimate (get costs before submitting)
   */
  async estimateOrder(orderData: PrintfulOrderRequest) {
    return this.request('/orders/estimate-costs', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Create and submit order
   */
  async createOrder(orderData: PrintfulOrderRequest, confirm: boolean = false): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(
      `/orders${confirm ? '?confirm=1' : ''}`,
      {
        method: 'POST',
        body: JSON.stringify(orderData),
      }
    );
    return response.result;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number | string): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(`/orders/${orderId}`, { method: 'GET' });
    return response.result;
  }

  /**
   * Get order by external ID (Boptone order ID)
   */
  async getOrderByExternalId(externalId: string): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(`/orders/@${externalId}`, { method: 'GET' });
    return response.result;
  }

  /**
   * Update order
   */
  async updateOrder(orderId: number | string, orderData: Partial<PrintfulOrderRequest>, confirm: boolean = false): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(
      `/orders/${orderId}${confirm ? '?confirm=1' : ''}`,
      {
        method: 'PUT',
        body: JSON.stringify(orderData),
      }
    );
    return response.result;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number | string): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(`/orders/${orderId}`, { method: 'DELETE' });
    return response.result;
  }

  /**
   * Confirm draft order (submit for fulfillment)
   */
  async confirmOrder(orderId: number | string): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>(`/orders/${orderId}/confirm`, { method: 'POST' });
    return response.result;
  }

  /**
   * Get all orders
   */
  async getOrders(params?: { status?: string; offset?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/orders?${queryParams.toString()}`, { method: 'GET' });
  }

  /**
   * Generate mockup images
   */
  async generateMockup(taskKey: string, mockupData: PrintfulMockupRequest) {
    return this.request(`/mockup-generator/create-task/${taskKey}`, {
      method: 'POST',
      body: JSON.stringify(mockupData),
    });
  }

  /**
   * Get mockup generation task result
   */
  async getMockupTask(taskKey: string): Promise<{ status: string; mockups?: PrintfulMockup[] }> {
    const response = await this.request<{ status: string; mockups?: PrintfulMockup[] }>(
      `/mockup-generator/task?task_key=${taskKey}`,
      { method: 'GET' }
    );
    return response.result;
  }

  /**
   * Get shipping rates for order
   */
  async getShippingRates(recipient: PrintfulRecipient, items: PrintfulOrderItem[]) {
    return this.request('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify({ recipient, items }),
    });
  }

  /**
   * Get countries list
   */
  async getCountries() {
    return this.request('/countries', { method: 'GET' });
  }

  /**
   * Get tax rates
   */
  async getTaxRates(recipient: PrintfulRecipient) {
    return this.request('/tax/rates', {
      method: 'POST',
      body: JSON.stringify({ recipient }),
    });
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
 * Create Printful client instance
 */
export function createPrintfulClient(apiToken: string, storeId?: string): PrintfulClient {
  return new PrintfulClient({ apiToken, storeId });
}
