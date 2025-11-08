# Future Features Roadmap

## Post-V0 Features to Implement

### Phase 1: Video Processing Pipeline
The core vision of the project - converting videos into merch.

#### Video Upload
- Replace/extend image upload to accept video files
- Support common video formats (MP4, MOV, WebM)
- Handle larger file sizes (streaming uploads)

#### Transcript Generation with Timestamps
- Extract audio from uploaded video
- Generate transcript with precise timestamps
- Options to explore:
  - OpenAI Whisper API (high accuracy, timestamps included)
  - AssemblyAI (excellent timestamps, speaker detection)
  - Continue with existing `transcript_gen.py` approach (Google Speech Recognition) but add timestamp extraction

#### AI Frame Selection
- Use transcript to identify the most significant/iconic moment
- AI prompt engineering to detect:
  - Punchlines in comedy content
  - Memorable quotes
  - Emotional peaks
  - Visual highlights
- Extract frame at the identified timestamp
- Consider using:
  - GPT-4 for semantic analysis of transcript
  - Claude for context understanding

#### Image Enhancement
- Take the selected frame and enhance it for merch
- Clean up the image (remove artifacts, improve resolution)
- Options to explore:
  - AI upscaling (e.g., Real-ESRGAN)
  - Background removal if needed
  - Color correction and enhancement
  - DALL-E or Stable Diffusion for refinement

#### Technical Components
- Integrate existing `server/transcript_gen.py` into Next.js workflow
- Handle video processing asynchronously (job queue)
- Progress indicators for long-running operations
- Temporary storage for video files before processing

### Phase 2: Shopify Integration
Enable actual product creation and sales.

#### Shopify Admin API
- Automatically create products in Shopify store
- Set product details (title, description, price)
- Upload mockup images as product images
- Manage inventory and variants

#### Shopify Storefront
- Display products to potential buyers
- Shopping cart functionality
- Checkout integration
- Order management

#### Integration Flow
1. After mockups are generated
2. "Create Products" button appears
3. User clicks to push products to Shopify
4. Products are created with mockup images
5. User gets link to their new Shopify products
6. Products are immediately available for purchase

### Phase 3: User Authentication & Management
- User accounts (email/password or OAuth)
- Personal dashboard showing all uploads
- Manage created products
- Track sales (if Shopify integrated)
- Usage limits/quotas

### Phase 4: Advanced Mockup Options
- Expand beyond mug, shirt, blanket
- Product type selection by user
- Multiple color variants
- Size options
- Custom positioning/sizing of image on product

### Phase 5: Customization & Editing
- Let users manually select different frames
- Image editing tools (crop, filters, text overlay)
- Choose alternative moments from transcript
- A/B testing different designs

### Phase 6: Monetization Features
- Printful integration for print-on-demand fulfillment
- Automatic order fulfillment
- Revenue sharing models
- Creator analytics

### Phase 7: Social Features
- Share mockups on social media
- Viral moment detection
- Trending uploads/products
- Community showcase

## Technical Debt & Improvements
- Add comprehensive error handling
- Implement retry logic for external APIs
- Add rate limiting
- Caching for frequently accessed data
- Performance optimization for image processing
- Comprehensive testing suite
- CI/CD pipeline
- Monitoring and logging

## Research Needed
- Best AI model for identifying "iconic moments" in video
- Optimal Printful product IDs and configuration
- Shopify API best practices
- Video processing optimization for scale
- Cost analysis for AI APIs at scale

