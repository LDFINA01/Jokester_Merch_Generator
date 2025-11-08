// Printful API integration for mockup generation

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_API_BASE = 'https://api.printful.com';

if (!PRINTFUL_API_KEY) {
  console.warn('Warning: PRINTFUL_API_KEY is not set');
}

// Product IDs for our merch items
export const PRODUCT_IDS = {
  MUG: 19, // Classic Mug 11oz
  SHIRT: 71, // Unisex T-Shirt
  BLANKET: 445, // Fleece Blanket
};

// Variant IDs (we'll use default sizes/colors)
export const VARIANT_IDS = {
  MUG: 1320, // White Glossy Mug 11 oz
  SHIRT: 4011, // Bella + Canvas 3001 White / S
  // BLANKET: 9411, // Product 445 not found - temporarily disabled
};

interface MockupRequest {
  variant_ids: number[];
  format: string;
  files: Array<{
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

interface PrintfulMockupResponse {
  code: number;
  result: {
    variant_ids: number[];
    mockups: Array<{
      variant_id: number;
      placement: string;
      mockup_url: string;
    }>;
  };
}

// Helper to make Printful API requests
async function printfulRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${PRINTFUL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Printful API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Helper function to add delay between requests
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate mockup for a single product
async function generateMockup(
  productId: number,
  variantId: number,
  imageUrl: string,
  placement: string = 'default'
): Promise<string> {
  const request: MockupRequest = {
    variant_ids: [variantId],
    format: 'jpg',
    files: [
      {
        placement,
        image_url: imageUrl,
        position: {
          area_width: 1800,
          area_height: 2400,
          width: 1800,
          height: 1800,
          top: 300,
          left: 0,
        },
      },
    ],
  };

  const response: PrintfulMockupResponse = await printfulRequest(
    `/mockup-generator/create-task/${productId}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  // The task is created, now we need to fetch the result
  const taskKey = response.result.mockups[0]?.mockup_url;
  if (!taskKey) {
    throw new Error('No mockup URL returned from Printful');
  }

  return taskKey;
}

// Generate all mockups (mug, shirt)
export async function generateAllMockups(imageUrl: string) {
  try {
    // Generate mockups SEQUENTIALLY with delays to avoid rate limiting
    console.log('Generating mug mockup...');
    const mugUrl = await generateMockup(
      PRODUCT_IDS.MUG,
      VARIANT_IDS.MUG,
      imageUrl,
      'default'
    );
    
    // Wait 2 seconds between requests to avoid rate limiting
    await delay(2000);
    
    console.log('Generating shirt mockup...');
    const shirtUrl = await generateMockup(
      PRODUCT_IDS.SHIRT,
      VARIANT_IDS.SHIRT,
      imageUrl,
      'default'
    );

    console.log('All mockups generated successfully!');
    return {
      mug: mugUrl,
      shirt: shirtUrl,
    };
  } catch (error) {
    console.error('Error generating mockups:', error);
    throw new Error('Failed to generate mockups from Printful');
  }
}

// Get product information
export async function getProductInfo(productId: number) {
  return printfulRequest(`/products/${productId}`);
}

// Get variant information
export async function getVariantInfo(variantId: number) {
  return printfulRequest(`/products/variant/${variantId}`);
}

// Alternative: Use Printful's printfile endpoint for more control
export async function createPrintfile(imageUrl: string) {
  const response = await printfulRequest('/files', {
    method: 'POST',
    body: JSON.stringify({
      url: imageUrl,
      type: 'default',
    }),
  });

  return response.result.id;
}

