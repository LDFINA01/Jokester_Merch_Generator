# Version 0 Specifications

## Overview
Version 0 is a simplified proof-of-concept that demonstrates the core merch generation workflow without video processing complexity.

## Features

### Core Functionality
- **Image Upload**: Users can upload a single image (drag-and-drop or click-to-browse)
- **Merch Mockup Generation**: Automatically generate mockups for 3 product types:
  - Classic Mug
  - Unisex T-Shirt
  - Fleece Blanket
- **Upload History**: Track and display previous uploads with their mockups

### Technical Stack

#### Frontend
- Next.js 15 (App Router)
- React with TypeScript
- Tailwind CSS for styling
- Responsive design (mobile-friendly)

#### Backend
- Next.js API Routes (Node runtime)
- Vercel Blob for image storage
- Supabase (Postgres) for upload tracking
- Printful Mockup Generator API

### User Flow
1. User lands on homepage
2. User uploads an image via drag-and-drop or file picker
3. Image is validated (file type, size)
4. Image is uploaded to Vercel Blob storage
5. Printful API generates mockups for all 3 product types
6. Upload record is saved to Supabase database
7. Mockups are displayed to user in a grid layout
8. Previous uploads are shown below in history section

### Limitations (V0)
- No video processing (coming in future versions)
- No AI frame selection or image enhancement
- No Shopify integration or actual purchasing
- No user authentication (optional user_identifier field for future)
- No transcript generation

### Environment Variables Required
```
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
PRINTFUL_API_KEY=<printful-api-key>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

### Database Schema

#### uploads table
```sql
create table uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  original_image_url text not null,
  mockup_urls jsonb not null,
  user_identifier text
);
```

### API Endpoints

#### POST /api/upload
Handles image upload to Vercel Blob
- Request: multipart/form-data with image file
- Response: { url: string, filename: string }

#### POST /api/mockups
Generates Printful mockups from uploaded image
- Request: { imageUrl: string }
- Response: { mug: string, shirt: string, blanket: string }

#### GET /api/history
Fetches upload history from Supabase
- Response: Array of upload records with mockup URLs

### Success Criteria
- User can upload an image successfully
- Mockups generate correctly for all 3 products
- Upload history persists and displays correctly
- UI is responsive and user-friendly
- Error states are handled gracefully

