'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Download, Share2, Loader2, Package } from 'lucide-react';

interface MockupDisplayProps {
  mockups: Record<string, string>;
  isLoading: boolean;
  uploadId?: string;
  originalImageUrl?: string;
}

const products = [
  { 
    name: 'Classic Mug', 
    key: 'mug' as const, 
    description: '11oz ceramic mug',
    price: 24.99,
  },
  { 
    name: 'Unisex T-Shirt', 
    key: 'shirt' as const, 
    description: 'Bella + Canvas 3001',
    price: 29.99,
  },
  { 
    name: 'Shower Curtain', 
    key: 'shower_curtain' as const, 
    description: '71"x74" polyester curtain',
    price: 49.99,
  },
  { 
    name: 'Bath Mat', 
    key: 'bath_mat' as const, 
    description: 'Memory foam with anti-slip backing',
    price: 39.99,
  },
  { 
    name: 'Beach Towel', 
    key: 'towel' as const, 
    description: '30"x60" all-over print',
    price: 34.99,
  },
  { 
    name: 'Dad Hat', 
    key: 'hat' as const, 
    description: 'Classic adjustable cap',
    price: 27.99,
  },
  { 
    name: 'iPhone Case', 
    key: 'phone_case' as const, 
    description: 'Clear protective case',
    price: 22.99,
  },
  { 
    name: 'Sweatpants', 
    key: 'sweatpants' as const, 
    description: 'Unisex fleece sweatpants',
    price: 44.99,
  },
  { 
    name: 'Pillow', 
    key: 'pillow' as const, 
    description: '18"x18" all-over print',
    price: 32.99,
  },
  { 
    name: 'Square Sticker', 
    key: 'sticker' as const, 
    description: '3"x3" kiss-cut sticker',
    price: 4.99,
  },
];

export default function MockupDisplay({ mockups, isLoading, uploadId, originalImageUrl }: MockupDisplayProps) {
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuyNow = async (productType: 'mug' | 'shirt' | 'shower_curtain' | 'bath_mat' | 'towel' | 'hat' | 'phone_case' | 'sweatpants' | 'pillow' | 'sticker') => {
    if (!uploadId) {
      setError('Upload ID not found. Please try generating the mockup again.');
      return;
    }

    try {
      setBuyingProduct(productType);
      setError(null);

      const response = await fetch('/api/create-shopify-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          productType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await response.json();
      
      // Open Shopify product page in new tab
      window.open(data.shopifyUrl, '_blank');
    } catch (err) {
      console.error('Error creating Shopify product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setBuyingProduct(null);
    }
  };

  if (!isLoading && Object.keys(mockups).length === 0) {
    return null;
  }

  // Filter products to only show those that have mockups
  const productsWithMockups = products.filter(product => mockups[product.key]);

  if (productsWithMockups.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <Package className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Generated Mockups</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {productsWithMockups.map((product) => (
          <div
            key={product.key}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="aspect-square relative bg-gray-50 dark:bg-gray-900">
              {mockups[product.key] ? (
                <Image
                  src={mockups[product.key]}
                  alt={`${product.name} mockup`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No mockup available</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {product.description}
                  </p>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  ${product.price}
                </span>
              </div>
              
              {mockups[product.key] && (
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => handleBuyNow(product.key)}
                    disabled={buyingProduct === product.key}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buyingProduct === product.key ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </>
                    )}
                  </button>
                  
                  <div className="flex gap-2">
                    <a
                      href={mockups[product.key]}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${product.name} Mockup`,
                            url: mockups[product.key],
                          });
                        } else {
                          navigator.clipboard.writeText(mockups[product.key]);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

