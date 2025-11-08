# Jokester Merch Generator

Turn images into custom merchandise mockups instantly. Upload an image, and we'll generate professional mockups for mugs, t-shirts, and blankets.

## Version 0 - Image to Merch

This is Version 0 of the project, focused on demonstrating the core mockup generation workflow. Video processing and AI features are planned for future versions.

## Features

- Drag-and-drop image upload
- Automatic mockup generation for 3 product types:
  - Classic Mug (11oz)
  - Unisex T-Shirt
  - Fleece Blanket (50" × 60")
- Upload history with persistent storage
- Responsive, modern UI
- Dark mode support

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Storage**: Vercel Blob
- **Database**: Supabase (Postgres)
- **Mockup Generation**: Printful API
- **Hosting**: Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Vercel account (for Blob storage and hosting)
- Supabase account (for database)
- Printful account (for mockup generation)

### 2. Clone and Install

```bash
git clone https://github.com/yourusername/Jokester_Merch_Generator.git
cd Jokester_Merch_Generator
npm install
```

### 3. Set Up Vercel Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create → Blob
3. Copy the `BLOB_READ_WRITE_TOKEN`

### 4. Set Up Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Once created, go to Project Settings → API
4. Copy the Project URL and anon/public key
5. Go to SQL Editor and run the schema from `.cursor/supabase-schema.sql`:

```sql
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  original_image_url text not null,
  mockup_urls jsonb not null,
  user_identifier text
);

create index if not exists uploads_created_at_idx on public.uploads (created_at desc);

alter table public.uploads enable row level security;

create policy "Allow all operations for V0"
  on public.uploads
  for all
  using (true)
  with check (true);
```

### 5. Set Up Printful

1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Navigate to Settings → API
3. Create a new API key
4. Copy the API key

### 6. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Printful API
PRINTFUL_API_KEY=your_printful_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Go to Project Settings → Environment Variables
# Add all variables from .env.local
```

## Usage

1. Open the application in your browser
2. Drag and drop an image or click to browse
3. Wait for the mockups to generate (usually 10-30 seconds)
4. View your mockups for mug, shirt, and blanket
5. Download or share the mockup images
6. View your upload history below

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # Image upload to Vercel Blob
│   │   ├── mockups/route.ts     # Mockup generation via Printful
│   │   └── history/route.ts     # Fetch upload history
│   ├── components/
│   │   ├── ImageUpload.tsx      # Drag-and-drop upload component
│   │   └── MockupDisplay.tsx    # Display generated mockups
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main page
│   └── globals.css              # Global styles
├── lib/
│   ├── supabase.ts              # Supabase client and helpers
│   └── printful.ts              # Printful API integration
├── server/                      # Python backend (for future video processing)
│   ├── server.py
│   └── transcript_gen.py
├── .cursor/                     # Project documentation
│   ├── v0-specs.md             # Version 0 specifications
│   ├── future-features.md      # Roadmap for future versions
│   └── supabase-schema.sql     # Database schema
└── README.md
```

## API Endpoints

### POST /api/upload
Uploads an image to Vercel Blob storage.

**Request**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "url": "https://...",
  "filename": "image.jpg",
  "size": 1234567
}
```

### POST /api/mockups
Generates mockups using Printful API and saves to database.

**Request**:
```json
{
  "imageUrl": "https://...",
  "userIdentifier": "optional-user-id"
}
```

**Response**:
```json
{
  "success": true,
  "mockups": {
    "mug": "https://files.cdn.printful.com/...",
    "shirt": "https://files.cdn.printful.com/...",
    "blanket": "https://files.cdn.printful.com/..."
  }
}
```

### GET /api/history
Fetches recent uploads from the database.

**Response**:
```json
{
  "success": true,
  "uploads": [
    {
      "id": "uuid",
      "created_at": "2025-11-08T12:00:00Z",
      "original_image_url": "https://...",
      "mockup_urls": { ... }
    }
  ]
}
```

## Future Features

See `.cursor/future-features.md` for the complete roadmap, including:

- Video upload and processing
- AI-powered transcript analysis to identify iconic moments
- Automatic frame extraction and enhancement
- Shopify integration for actual product sales
- User authentication and personal dashboards
- More product types and customization options

## Troubleshooting

### Mockups not generating
- Check that your Printful API key is valid
- Ensure the image URL is publicly accessible
- Check Printful API status

### Upload failing
- Verify Vercel Blob token is correct
- Check file size (must be under 10MB)
- Ensure file type is JPEG, PNG, or WebP

### Database errors
- Verify Supabase credentials
- Check that the `uploads` table exists
- Ensure RLS policies are configured correctly

## Contributing

This is a hackathon project. Future contributions welcome!

## License

MIT