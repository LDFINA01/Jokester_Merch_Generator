import { NextResponse } from 'next/server';

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_API_BASE = 'https://api.printful.com';

async function printfulRequest(endpoint: string) {
  const response = await fetch(`${PRINTFUL_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Printful API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function GET() {
  try {
    // Fetch info for our three products
    const [mugInfo, shirtInfo, blanketInfo] = await Promise.all([
      printfulRequest('/products/19').catch(e => ({ error: e.message })),
      printfulRequest('/products/71').catch(e => ({ error: e.message })),
      printfulRequest('/products/445').catch(e => ({ error: e.message })),
    ]);

    return NextResponse.json({
      success: true,
      products: {
        mug: mugInfo,
        shirt: shirtInfo,
        blanket: blanketInfo,
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

