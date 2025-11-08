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
  SHIRT: 29.99,
  SHOWER_CURTAIN: 49.99,
  BATH_MAT: 39.99,
  TOWEL: 34.99,
  HAT: 27.99,
  PHONE_CASE: 22.99,
};

export type ProductType = 'mug' | 'shirt' | 'shower_curtain' | 'bath_mat' | 'towel' | 'hat' | 'phone_case';

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
  // Map product type to Shopify product type
  const productTypeMap: Record<ProductType, string> = {
    mug: 'Mug',
    shirt: 'T-Shirt',
    shower_curtain: 'Home & Living',
    bath_mat: 'Home & Living',
    towel: 'Home & Living',
    hat: 'Accessories',
    phone_case: 'Accessories',
  };

  // Create the product
  const productData = {
    product: {
      title,
      body_html: description,
      vendor: 'Custom Merch Generator',
      product_type: productTypeMap[productType],
      tags: ['custom', 'print-on-demand', 'personalized'],
      status: 'active',
      variants: [
        {
          price: price.toString(),
          sku: `CUSTOM-${productType.toUpperCase().replace('_', '-')}-${Date.now()}`,
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
  const shopifyDomain = SHOPIFY_STORE_DOMAIN || '';
  const shopifyUrl = `https://${shopifyDomain.replace('.myshopify.com', '')}.myshopify.com/products/${product.handle}`;

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
  const typeLabelMap: Record<ProductType, string> = {
    mug: 'Mug',
    shirt: 'T-Shirt',
    shower_curtain: 'Shower Curtain',
    bath_mat: 'Bath Mat',
    towel: 'Beach Towel',
    hat: 'Dad Hat',
    phone_case: 'iPhone Case',
  };
  return `Custom ${typeLabelMap[productType]} Design`;
}

// Helper to generate product description
export function generateProductDescription(productType: ProductType): string {
  const descriptions: Record<ProductType, string> = {
    mug: `
      <p>Your personalized design on a premium 11oz ceramic mug.</p>
      <ul>
        <li>High-quality ceramic</li>
        <li>Dishwasher and microwave safe</li>
        <li>Vibrant, full-color printing</li>
        <li>Perfect gift or personal use</li>
      </ul>
    `,
    shirt: `
      <p>Your custom design on a comfortable, high-quality unisex t-shirt.</p>
      <ul>
        <li>100% combed and ring-spun cotton (Bella + Canvas 3001)</li>
        <li>Soft, breathable fabric</li>
        <li>Vibrant, durable printing</li>
        <li>True to size fit</li>
      </ul>
    `,
    shower_curtain: `
      <p>Transform your bathroom with a custom shower curtain featuring your design.</p>
      <ul>
        <li>71"×74" polyester fabric</li>
        <li>Water-resistant material</li>
        <li>12 reinforced eyelets</li>
        <li>One-sided vibrant print</li>
      </ul>
    `,
    bath_mat: `
      <p>Step out in style with a custom memory foam bath mat.</p>
      <ul>
        <li>24"×17" memory foam</li>
        <li>Soft microfiber surface</li>
        <li>Anti-slip backing for safety</li>
        <li>Water absorbent and quick-drying</li>
      </ul>
    `,
    towel: `
      <p>Hit the beach with your personalized all-over print beach towel.</p>
      <ul>
        <li>30"×60" plush towel</li>
        <li>52% cotton, 48% polyester blend</li>
        <li>Vibrant one-sided print</li>
        <li>Terry fabric backing for absorbency</li>
      </ul>
    `,
    hat: `
      <p>Complete your look with a custom embroidered dad hat.</p>
      <ul>
        <li>Yupoong 6245CM unstructured cap</li>
        <li>Adjustable strap for perfect fit</li>
        <li>Curved visor</li>
        <li>One size fits most</li>
      </ul>
    `,
    phone_case: `
      <p>Protect your iPhone in style with a custom clear case.</p>
      <ul>
        <li>Fits iPhone 15</li>
        <li>Solid polycarbonate back</li>
        <li>Flexible, see-through sides</li>
        <li>Wireless charging compatible</li>
      </ul>
    `,
  };
  
  return descriptions[productType];
}

