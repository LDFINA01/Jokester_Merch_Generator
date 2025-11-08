import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate video
    const validTypes = ['video/mp4', 'video/quicktime', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid video type. Please upload MP4, MOV, or AVI.' },
        { status: 400 }
      );
    }
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Video too large. Max 100MB.' }, { status: 400 });
    }

    // Upload video to Vercel Blob
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });

    // POST to Flask with video_url
    const flaskResponse = await fetch('https://jokester-merch-generator.onrender.com/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: blob.url }),
    });
    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.text();
      console.error('Flask error:', errorData);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
    const flaskData = await flaskResponse.json();
    const imageUrl = flaskData.image_url;

    return NextResponse.json({
      url: imageUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
