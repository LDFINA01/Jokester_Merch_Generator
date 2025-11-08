import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Types for our database
export interface Upload {
  id: string;
  created_at: string;
  original_image_url: string;
  mockup_urls: {
    mug: string;
    shirt: string;
    blanket: string;
  };
  user_identifier?: string;
  theme?: string;
  shopify_product_ids?: {
    mug?: string;
    shirt?: string;
  };
  shopify_product_urls?: {
    mug?: string;
    shirt?: string;
  };
}

// Helper function to create upload record
export async function createUpload(data: {
  original_image_url: string;
  mockup_urls: Upload['mockup_urls'];
  user_identifier?: string;
  theme?: string;
}) {
  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return upload as Upload;
}

// Helper function to get all uploads
export async function getUploads(limit = 20) {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Upload[];
}

// Helper function to get upload by ID
export async function getUploadById(id: string) {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Upload;
}

// Helper function to update upload with Shopify product info
export async function updateUploadShopifyInfo(
  id: string,
  productType: 'mug' | 'shirt',
  shopifyProductId: string,
  shopifyProductUrl: string
) {
  const { data: existingUpload, error: fetchError } = await supabaseAdmin
    .from('uploads')
    .select('shopify_product_ids, shopify_product_urls')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const shopifyProductIds = existingUpload?.shopify_product_ids || {};
  const shopifyProductUrls = existingUpload?.shopify_product_urls || {};

  shopifyProductIds[productType] = shopifyProductId;
  shopifyProductUrls[productType] = shopifyProductUrl;

  const { data, error } = await supabaseAdmin
    .from('uploads')
    .update({
      shopify_product_ids: shopifyProductIds,
      shopify_product_urls: shopifyProductUrls,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Upload;
}

