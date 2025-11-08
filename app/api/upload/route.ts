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
    console.log('Uploading video to Vercel Blob...');
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
    console.log('Video uploaded:', blob.url);

    // POST to Flask with video_url
    const flaskPayload = { video_url: blob.url };
    console.log('Sending to Flask:', JSON.stringify(flaskPayload));
    
    const flaskResponse = await fetch('https://jokester-merch-generator.onrender.com/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flaskPayload),
      signal: AbortSignal.timeout(120000), // 120 second timeout
    });
    
    if (!flaskResponse.ok) {
      let errorMessage = 'Processing failed';
      try {
        const errorData = await flaskResponse.json();
        console.error('Flask error response:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        const errorText = await flaskResponse.text();
        console.error('Flask error (text):', errorText);
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
    const flaskData = await flaskResponse.json();
    console.log('Flask response:', flaskData);
    const imageUrl = flaskData.image_url;
    
    if (!imageUrl) {
      console.error('No image_url in Flask response');
      return NextResponse.json({ error: 'No image URL returned from processing' }, { status: 500 });
    }

    console.log('Processing complete, returning image URL:', imageUrl);
    return NextResponse.json({
      url: imageUrl,
      filename: file.name,
      size: file.size,
      phrase: flaskData.phrase,
    });
  } catch (error) {
    console.error('Upload/Processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}
