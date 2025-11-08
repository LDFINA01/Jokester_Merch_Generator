'use client';

import { useState, useEffect } from 'react';
import { Coffee, Shirt, Droplets, Bath, Waves, CircleDot, Smartphone, User, Square, Sticker, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Product {
  key: string;
  name: string;
  description: string;
  price: number;
  Icon: LucideIcon;
}

const availableProducts: Product[] = [
  { key: 'mug', name: 'Classic Mug', description: '11oz ceramic mug', price: 24.99, Icon: Coffee },
  { key: 'shirt', name: 'Unisex T-Shirt', description: 'Bella + Canvas 3001', price: 29.99, Icon: Shirt },
  { key: 'shower_curtain', name: 'Shower Curtain', description: '71"x74" polyester curtain', price: 49.99, Icon: Droplets },
  { key: 'bath_mat', name: 'Bath Mat', description: 'Memory foam with anti-slip backing', price: 39.99, Icon: Bath },
  { key: 'towel', name: 'Beach Towel', description: '30"x60" all-over print', price: 34.99, Icon: Waves },
  { key: 'hat', name: 'Dad Hat', description: 'Classic adjustable cap', price: 27.99, Icon: CircleDot },
  { key: 'phone_case', name: 'iPhone Case', description: 'Clear protective case', price: 22.99, Icon: Smartphone },
  { key: 'sweatpants', name: 'Sweatpants', description: 'Unisex fleece sweatpants', price: 44.99, Icon: User },
  { key: 'pillow', name: 'Pillow', description: '18"x18" all-over print', price: 32.99, Icon: Square },
  { key: 'sticker', name: 'Square Sticker', description: '3"x3" kiss-cut sticker', price: 4.99, Icon: Sticker },
];

interface ProductSelectorProps {
  imageUrl: string;
  onMockupsGenerated: (mockups: Record<string, string>, uploadId?: string) => void;
  existingMockups?: Record<string, string>;
}

export default function ProductSelector({ imageUrl, onMockupsGenerated, existingMockups = {} }: ProductSelectorProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
      setCooldownSeconds(remaining);

      if (remaining === 0) {
        setCooldownUntil(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const toggleProduct = (productKey: string) => {
    // Can't toggle during generation or cooldown
    if (isGenerating || cooldownUntil) return;
    
    // Can't select if already generated
    if (existingMockups[productKey]) return;

    setSelectedProducts(prev => 
      prev.includes(productKey)
        ? prev.filter(k => k !== productKey)
        : [...prev, productKey]
    );
  };

  const handleGenerateMockups = async () => {
    if (selectedProducts.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/mockups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          selectedProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mockups');
      }

      const data = await response.json();
      
      // Merge new mockups with existing ones
      const allMockups = { ...existingMockups, ...data.mockups };
      onMockupsGenerated(allMockups, data.upload?.id);

      // Clear selection
      setSelectedProducts([]);

      // Start 60-second cooldown
      setCooldownUntil(Date.now() + 60000);
    } catch (err) {
      console.error('Error generating mockups:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mockups');
    } finally {
      setIsGenerating(false);
    }
  };

  const getProductStatus = (productKey: string) => {
    if (existingMockups[productKey]) return 'generated';
    if (isGenerating && selectedProducts.includes(productKey)) return 'generating';
    if (selectedProducts.includes(productKey)) return 'selected';
    return 'available';
  };

  const isDisabled = isGenerating || cooldownUntil !== null;
  const canGenerate = selectedProducts.length > 0 && !isDisabled;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Products for Mockups</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose which products you'd like to generate mockups for
        </p>
        {Object.keys(existingMockups).length > 0 && (
          <div className="inline-flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400">
              {Object.keys(existingMockups).length} mockup(s) already generated
            </p>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {availableProducts.map(product => {
          const status = getProductStatus(product.key);
          const isSelected = selectedProducts.includes(product.key);
          const isGenerated = existingMockups[product.key];
          const ProductIcon = product.Icon;

          return (
            <button
              key={product.key}
              onClick={() => toggleProduct(product.key)}
              disabled={isDisabled || !!isGenerated}
              className={`
                relative p-4 rounded-lg border transition-colors
                ${status === 'generated' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20 cursor-not-allowed' 
                  : status === 'selected'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isDisabled && !isGenerated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex justify-center mb-3">
                <ProductIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{product.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{product.description}</p>
              <p className="text-sm font-semibold text-blue-600">${product.price}</p>
              
              {status === 'generated' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </div>
              )}
              {status === 'generating' && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedProducts.length} product(s)
            </p>
            {selectedProducts.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Estimated time: ~{selectedProducts.length * 8} seconds
              </p>
            )}
          </div>

          <button
            onClick={handleGenerateMockups}
            disabled={!canGenerate}
            className={`
              inline-flex items-center gap-2 px-6 py-2 rounded-md font-normal transition-colors
              ${canGenerate
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {selectedProducts.length} Mockup{selectedProducts.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>

        {cooldownUntil && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Cooldown active: Please wait {cooldownSeconds} seconds before generating more mockups
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

