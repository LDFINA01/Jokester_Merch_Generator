import { put } from '@vercel/blob';  // Keep for images
import { supabaseAdmin } from '@/lib/supabase';  // Add for videos
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      // Handle videos: Upload to Supabase, process with Flask
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
      // Upload to Supabase
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabaseAdmin.storage.from('videos').upload(fileName, file);
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Video upload failed' }, { status: 500 });
      }
      const videoIndex = data.path;
      // POST to Flask
      const flaskResponse = await fetch('https://jokester-merch-generator.onrender.com/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_index: videoIndex }),
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
    } else {
      // Original logic for images: Upload to Vercel Blob
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Please upload JPEG, PNG, or WebP.' },
          { status: 400 }
        );
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
      }
      const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
      return NextResponse.json({
        url: blob.url,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
