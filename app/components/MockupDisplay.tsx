'use client';

import Image from 'next/image';

interface MockupDisplayProps {
  mockups: {
    mug: string;
    shirt: string;
  } | null;
  isLoading: boolean;
}

const products = [
  { name: 'Classic Mug', key: 'mug' as const, description: '11oz ceramic mug' },
];

export default function MockupDisplay({ mockups, isLoading }: MockupDisplayProps) {
  if (!isLoading && !mockups) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-center">Your Merch Mockups</h2>
      
      <div className="flex justify-center max-w-2xl mx-auto">
        {products.map((product) => (
          <div
            key={product.key}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-full"
          >
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-900">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generating {product.name.toLowerCase()}...
                    </p>
                  </div>
                </div>
              ) : mockups && mockups[product.key] ? (
                <Image
                  src={mockups[product.key]}
                  alt={`${product.name} mockup`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400">No mockup available</p>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {product.description}
              </p>
              
              {mockups && mockups[product.key] && !isLoading && (
                <div className="flex gap-2">
                  <a
                    href={mockups[product.key]}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
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
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

