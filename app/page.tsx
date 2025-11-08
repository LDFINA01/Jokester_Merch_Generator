'use client';

import Link from 'next/link';
import { Sparkles, Zap, Package, Download, Printer, MousePointer, Upload, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Merchify
              </span>
            </div>
            <Link
              href="/generator"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-normal"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Turn Your Images Into Custom Merchandise
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Generate professional product mockups in seconds. Upload your image, select products, and create amazing merch with zero design skills required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-normal"
            >
              Try It Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Create Amazing Merch
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Powerful features that make merchandise creation effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Instant Mockups
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate professional product mockups in seconds. No waiting, no complicated software.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  10+ Product Types
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mugs, t-shirts, phone cases, pillows, stickers, and more. Create mockups for any product.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  AI-Powered
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Future: Automatic frame extraction from videos and intelligent design optimization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Easy Export
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download high-quality mockups or share them instantly with a single click.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <Printer className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Printful Integration
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Direct integration with print-on-demand services. Order your products with one click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <MousePointer className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No Design Skills Needed
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simple drag-and-drop interface. If you can upload a file, you can create merch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Three simple steps to create your custom merchandise
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-semibold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Upload Your Image or Video
                  </h3>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Drag and drop your image or video file. We support JPEG, PNG, and MP4 formats.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-semibold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Select Products
                  </h3>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Choose from 10+ product types including mugs, t-shirts, phone cases, and more. Select as many as you want.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-semibold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Download or Buy
                  </h3>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Download your mockups or order physical products directly through our Printful integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Create Amazing Merch?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start generating professional mockups in seconds. No credit card required.
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-normal"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Merchify v0.1</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Powered by Vercel, Supabase, and Printful</p>
        </div>
      </footer>
    </div>
  );
}
