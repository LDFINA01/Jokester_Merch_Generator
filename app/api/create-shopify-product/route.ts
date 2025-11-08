import { NextRequest, NextResponse } from 'next/server';
import {
  createShopifyProduct,
  generateProductTitle,
  generateProductDescription,
  PRODUCT_PRICING,
  ProductType,
} from '@/lib/shopify';
import { updateUploadShopifyInfo, getUploadById } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, productType } = body;

    if (!uploadId) {
      return NextResponse.json(
        { error: 'No upload ID provided' },
        { status: 400 }
      );
    }

    if (!productType || !['mug', 'shirt'].includes(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type. Must be "mug" or "shirt"' },
        { status: 400 }
      );
    }

    // Get the upload record to retrieve mockup URL
    const upload = await getUploadById(uploadId);
    
    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Check if product already exists for this upload
    if (upload.shopify_product_urls && upload.shopify_product_urls[productType as ProductType]) {
      return NextResponse.json({
        success: true,
        shopifyUrl: upload.shopify_product_urls[productType as ProductType],
        productId: upload.shopify_product_ids?.[productType as ProductType],
        alreadyExists: true,
      });
    }

    // Get the mockup URL for the specified product type
    const mockupUrl = upload.mockup_urls[productType as 'mug' | 'shirt'];
    
    if (!mockupUrl) {
      return NextResponse.json(
        { error: `No mockup URL found for ${productType}` },
        { status: 400 }
      );
    }

    // Generate product title and description
    const title = generateProductTitle(productType as ProductType);
    const description = generateProductDescription(productType as ProductType);
    const price = PRODUCT_PRICING[productType.toUpperCase() as 'MUG' | 'SHIRT'];

    // Create the Shopify product
    console.log(`Creating Shopify product for ${productType}...`);
    const shopifyProduct = await createShopifyProduct({
      title,
      description,
      imageUrl: mockupUrl,
      productType: productType as ProductType,
      price,
    });

    // Update the upload record with Shopify product info
    await updateUploadShopifyInfo(
      uploadId,
      productType as 'mug' | 'shirt',
      shopifyProduct.productId,
      shopifyProduct.shopifyUrl
    );

    console.log(`Shopify product created: ${shopifyProduct.productId}`);

    return NextResponse.json({
      success: true,
      shopifyUrl: shopifyProduct.shopifyUrl,
      productId: shopifyProduct.productId,
      variantId: shopifyProduct.variantId,
    });
  } catch (error) {
    console.error('Shopify product creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Shopify product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

