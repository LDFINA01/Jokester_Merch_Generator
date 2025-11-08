// Shopify API integration for creating products dynamically

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
  console.warn('Warning: Shopify credentials are not set');
}

// Product pricing configuration
export const PRODUCT_PRICING = {
  MUG: 24.99,
  SHIRT: 34.99,
};

export type ProductType = 'mug' | 'shirt';

interface CreateProductParams {
  title: string;
  description: string;
  imageUrl: string;
  productType: ProductType;
  price: number;
}

interface ShopifyProductResponse {
  productId: string;
  variantId: string;
  shopifyUrl: string;
}

// Helper to make Shopify API requests
async function shopifyRequest(endpoint: string, options: RequestInit = {}) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Shopify API error - Status: ${response.status}, Body:`, error);
    throw new Error(`Shopify API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Create a product in Shopify with custom design
export async function createShopifyProduct({
  title,
  description,
  imageUrl,
  productType,
  price,
}: CreateProductParams): Promise<ShopifyProductResponse> {
  // Create the product
  const productData = {
    product: {
      title,
      body_html: description,
      vendor: 'Custom Merch Generator',
      product_type: productType === 'mug' ? 'Mug' : 'T-Shirt',
      tags: ['custom', 'print-on-demand', 'personalized'],
      status: 'active',
      variants: [
        {
          price: price.toString(),
          sku: `CUSTOM-${productType.toUpperCase()}-${Date.now()}`,
          inventory_management: null, // Printful handles inventory
          fulfillment_service: 'manual', // Will be fulfilled by Printful
        },
      ],
      images: [
        {
          src: imageUrl,
        },
      ],
    },
  };

  const response = await shopifyRequest('/products.json', {
    method: 'POST',
    body: JSON.stringify(productData),
  });

  const product = response.product;
  const productId = product.id.toString();
  const variantId = product.variants[0].id.toString();
  
  // Construct the product URL
  const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN.replace('.myshopify.com', '')}.myshopify.com/products/${product.handle}`;

  return {
    productId,
    variantId,
    shopifyUrl,
  };
}

// Get product by ID
export async function getShopifyProduct(productId: string) {
  return shopifyRequest(`/products/${productId}.json`);
}

// Update product image
export async function updateProductImage(productId: string, imageUrl: string) {
  const response = await shopifyRequest(`/products/${productId}/images.json`, {
    method: 'POST',
    body: JSON.stringify({
      image: {
        src: imageUrl,
      },
    }),
  });

  return response;
}

// Delete product (for testing/cleanup)
export async function deleteShopifyProduct(productId: string) {
  return shopifyRequest(`/products/${productId}.json`, {
    method: 'DELETE',
  });
}

// Helper to generate product title based on type
export function generateProductTitle(productType: ProductType): string {
  const typeLabel = productType === 'mug' ? 'Mug' : 'T-Shirt';
  return `Custom ${typeLabel} Design`;
}

// Helper to generate product description
export function generateProductDescription(productType: ProductType): string {
  if (productType === 'mug') {
    return `
      <p>Your personalized design on a premium 11oz ceramic mug.</p>
      <ul>
        <li>High-quality ceramic</li>
        <li>Dishwasher and microwave safe</li>
        <li>Vibrant, full-color printing</li>
        <li>Perfect gift or personal use</li>
      </ul>
    `;
  } else {
    return `
      <p>Your custom design on a comfortable, high-quality unisex t-shirt.</p>
      <ul>
        <li>100% combed and ring-spun cotton</li>
        <li>Soft, breathable fabric</li>
        <li>Vibrant, durable printing</li>
        <li>Available in White, Size S</li>
      </ul>
    `;
  }
}

