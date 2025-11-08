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
  const url = `${PRINTFUL_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Printful API error - Status: ${response.status}, Body:`, error);
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

  const response: any = await printfulRequest(
    `/mockup-generator/create-task/${productId}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
  
  // Check if this is a task-based response (async) or immediate response (sync)
  if (response.result?.task_key) {
    // This is an async task - need to poll for results
    const mockupUrl = await pollMockupTask(response.result.task_key);
    return mockupUrl;
  } else if (response.result?.mockups && response.result.mockups.length > 0) {
    const mockupUrl = response.result.mockups[0]?.mockup_url;
    if (!mockupUrl) {
      throw new Error('No mockup URL in response');
    }
    return mockupUrl;
  } else {
    console.error('Unexpected Printful API response structure:', response);
    throw new Error('Unexpected Printful API response structure');
  }
}

// Poll for mockup task completion
async function pollMockupTask(taskKey: string, maxAttempts: number = 30): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response: any = await printfulRequest(
        `/mockup-generator/task?task_key=${taskKey}`,
        {
          method: 'GET',
        }
      );

      if (response.code === 200 && response.result?.mockups && response.result.mockups.length > 0) {
        const mockupData = response.result.mockups[0];
        
        // For mugs, try to use the "Front view" from extras if available
        if (mockupData.extra && Array.isArray(mockupData.extra)) {
          const frontView = mockupData.extra.find((view: any) => 
            view.title?.toLowerCase().includes('front') || 
            view.option?.toLowerCase().includes('front')
          );
          if (frontView && frontView.url) {
            return frontView.url;
          }
        }
        
        // Otherwise use the default mockup URL
        return mockupData.mockup_url;
      }

      // Task still processing, wait before next attempt
      await delay(2000);
    } catch (error) {
      console.error(`Error polling task (attempt ${attempt}):`, error);
      if (attempt === maxAttempts) {
        throw new Error(`Failed to get mockup after ${maxAttempts} attempts`);
      }
      await delay(2000);
    }
  }

  throw new Error(`Mockup generation timed out after ${maxAttempts} attempts`);
}

// Generate all mockups (mug only for now)
export async function generateAllMockups(imageUrl: string) {
  console.log('Starting mockup generation...');
  
  try {
    const mugUrl = await generateMockup(
      PRODUCT_IDS.MUG,
      VARIANT_IDS.MUG,
      imageUrl,
      'default'  // Mugs use 'default' placement
    );
    
    console.log('Mockup generated successfully!');
    return {
      mug: mugUrl,
      shirt: null,  // Disabled for now
    };
  } catch (error) {
    console.error('Error generating mockups:', error);
    throw new Error(`Failed to generate mockups from Printful: ${error instanceof Error ? error.message : String(error)}`);
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

