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
  SHOWER_CURTAIN: 761, // Shower Curtain 71"×74"
  BATH_MAT: 884, // Bath Mat
  TOWEL: 259, // Beach Towel
  HAT: 206, // Classic Dad Hat
  PHONE_CASE: 181, // iPhone Clear Case
};

// Variant IDs (we'll use default sizes/colors)
export const VARIANT_IDS = {
  MUG: 1320, // White Glossy Mug 11 oz
  SHIRT: 4011, // Bella + Canvas 3001 White / S
  SHOWER_CURTAIN: 19454, // White / 71"×74"
  BATH_MAT: 22789, // White / 24"×17"
  TOWEL: 8874, // 30"×60"
  HAT: 7854, // Black / One size
  PHONE_CASE: 17616, // iPhone 15
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

// Helper to make Printful API requests with retry logic
async function printfulRequest(endpoint: string, options: RequestInit = {}, retries = 3) {
  const url = `${PRINTFUL_API_BASE}${endpoint}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return response.json();
      }

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const error = await response.text();
        console.warn(`Rate limited (attempt ${attempt}/${retries}). Waiting before retry...`);
        
        // Parse wait time from error message or use exponential backoff
        let waitTime = 30000; // Default 30 seconds
        try {
          const errorData = JSON.parse(error);
          const message = errorData.result || errorData.error?.message || '';
          const match = message.match(/(\d+)\s+seconds/);
          if (match) {
            waitTime = parseInt(match[1]) * 1000;
          }
        } catch (e) {
          // Use default wait time
        }
        
        if (attempt < retries) {
          console.log(`Waiting ${waitTime / 1000} seconds before retry...`);
          await delay(waitTime);
          continue;
        }
      }

      // For other errors or final retry, throw
      const error = await response.text();
      console.error(`Printful API error - Status: ${response.status}, Body:`, error);
      throw new Error(`Printful API error: ${response.status} - ${error}`);
      
    } catch (fetchError: any) {
      // Handle network errors (timeouts, connection failures)
      if (fetchError.message?.includes('fetch failed') || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.warn(`Network error (attempt ${attempt}/${retries}):`, fetchError.message);
        
        if (attempt < retries) {
          const backoffTime = attempt * 5000; // 5s, 10s, 15s
          console.log(`Retrying after ${backoffTime / 1000} seconds due to network error...`);
          await delay(backoffTime);
          continue;
        }
      }
      
      // Re-throw if it's not a recoverable error or we're out of retries
      throw fetchError;
    }
  }

  throw new Error('Max retries exceeded');
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

// Generate mockups for selected products only
export async function generateSelectedMockups(imageUrl: string, selectedProducts: string[]) {
  console.log(`Starting mockup generation for ${selectedProducts.length} selected product(s)...`);
  console.log(`Estimated time: ${selectedProducts.length * 8} seconds`);
  
  const results: Record<string, string> = {};
  
  try {
    for (let i = 0; i < selectedProducts.length; i++) {
      const productKey = selectedProducts[i];
      console.log(`[${i + 1}/${selectedProducts.length}] Generating ${productKey} mockup...`);
      
      let mockupUrl: string;
      
      switch (productKey) {
        case 'mug':
          mockupUrl = await generateMockup(PRODUCT_IDS.MUG, VARIANT_IDS.MUG, imageUrl, 'default');
          break;
        case 'shirt':
          mockupUrl = await generateMockup(PRODUCT_IDS.SHIRT, VARIANT_IDS.SHIRT, imageUrl, 'front');
          break;
        case 'shower_curtain':
          mockupUrl = await generateMockup(PRODUCT_IDS.SHOWER_CURTAIN, VARIANT_IDS.SHOWER_CURTAIN, imageUrl, 'default');
          break;
        case 'bath_mat':
          mockupUrl = await generateMockup(PRODUCT_IDS.BATH_MAT, VARIANT_IDS.BATH_MAT, imageUrl, 'front');
          break;
        case 'towel':
          mockupUrl = await generateMockup(PRODUCT_IDS.TOWEL, VARIANT_IDS.TOWEL, imageUrl, 'default');
          break;
        case 'hat':
          mockupUrl = await generateMockup(PRODUCT_IDS.HAT, VARIANT_IDS.HAT, imageUrl, 'default');
          break;
        case 'phone_case':
          mockupUrl = await generateMockup(PRODUCT_IDS.PHONE_CASE, VARIANT_IDS.PHONE_CASE, imageUrl, 'default');
          break;
        default:
          console.warn(`Unknown product type: ${productKey}`);
          continue;
      }
      
      results[productKey] = mockupUrl;
      
      // Add delay between products (except after the last one)
      if (i < selectedProducts.length - 1) {
        await delay(5000);
      }
    }
    
    console.log('Selected mockups generated successfully!');
    return results;
  } catch (error) {
    console.error('Error generating mockups:', error);
    throw new Error(`Failed to generate mockups from Printful: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate all mockups (kept for backward compatibility)
export async function generateAllMockups(imageUrl: string) {
  console.log('Starting mockup generation for all products...');
  console.log('This will take approximately 45-60 seconds to complete all products.');
  
  try {
    // Generate mug mockup
    console.log('[1/7] Generating mug mockup...');
    const mugUrl = await generateMockup(
      PRODUCT_IDS.MUG,
      VARIANT_IDS.MUG,
      imageUrl,
      'default'
    );
    await delay(5000); // Conservative 5-second delay

    // Generate shirt mockup
    console.log('[2/7] Generating shirt mockup...');
    const shirtUrl = await generateMockup(
      PRODUCT_IDS.SHIRT,
      VARIANT_IDS.SHIRT,
      imageUrl,
      'front'
    );
    await delay(5000);

    // Generate shower curtain mockup
    console.log('[3/7] Generating shower curtain mockup...');
    const showerCurtainUrl = await generateMockup(
      PRODUCT_IDS.SHOWER_CURTAIN,
      VARIANT_IDS.SHOWER_CURTAIN,
      imageUrl,
      'default'
    );
    await delay(5000);

    // Generate bath mat mockup
    console.log('[4/7] Generating bath mat mockup...');
    const bathMatUrl = await generateMockup(
      PRODUCT_IDS.BATH_MAT,
      VARIANT_IDS.BATH_MAT,
      imageUrl,
      'front'
    );
    await delay(5000);

    // Generate towel mockup
    console.log('[5/7] Generating towel mockup...');
    const towelUrl = await generateMockup(
      PRODUCT_IDS.TOWEL,
      VARIANT_IDS.TOWEL,
      imageUrl,
      'default'
    );
    await delay(5000);

    // Generate hat mockup
    console.log('[6/7] Generating hat mockup...');
    const hatUrl = await generateMockup(
      PRODUCT_IDS.HAT,
      VARIANT_IDS.HAT,
      imageUrl,
      'default'
    );
    await delay(5000);

    // Generate phone case mockup
    console.log('[7/7] Generating phone case mockup...');
    const phoneCaseUrl = await generateMockup(
      PRODUCT_IDS.PHONE_CASE,
      VARIANT_IDS.PHONE_CASE,
      imageUrl,
      'default'
    );
    
    console.log('All mockups generated successfully!');
    return {
      mug: mugUrl,
      shirt: shirtUrl,
      shower_curtain: showerCurtainUrl,
      bath_mat: bathMatUrl,
      towel: towelUrl,
      hat: hatUrl,
      phone_case: phoneCaseUrl,
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

