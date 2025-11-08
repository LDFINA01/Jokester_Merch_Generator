import { NextResponse } from 'next/server';
import { getUploads } from '@/lib/supabase';

export async function GET() {
  try {
    const uploads = await getUploads(20);

    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload history' },
      { status: 500 }
    );
  }
}

