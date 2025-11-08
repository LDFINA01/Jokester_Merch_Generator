import { NextRequest, NextResponse } from 'next/server';
import { generateSelectedMockups } from '@/lib/printful';
import { createUpload } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, userIdentifier, theme, selectedProducts, uploadId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    if (!selectedProducts || !Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return NextResponse.json(
        { error: 'No products selected' },
        { status: 400 }
      );
    }

    // Generate mockups only for selected products
    const mockupUrls = await generateSelectedMockups(imageUrl, selectedProducts);

    // Save to Supabase
    const upload = await createUpload({
      original_image_url: imageUrl,
      mockup_urls: mockupUrls,
      user_identifier: userIdentifier,
      theme: theme,
    });

    return NextResponse.json({
      success: true,
      upload,
      mockups: mockupUrls,
    });
  } catch (error) {
    console.error('Mockup generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mockups', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

