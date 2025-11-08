'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Upload, Home, Trash2 } from 'lucide-react';
import MediaUpload from '../components/MediaUpload';
import MockupDisplay from '../components/MockupDisplay';
import ProductSelector from '../components/ProductSelector';

interface Upload {
  id: string;
  created_at: string;
  original_image_url: string;
  mockup_urls: Record<string, string>;
  theme?: string;
}

export default function Generator() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentMockups, setCurrentMockups] = useState<Record<string, string>>({});
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [history, setHistory] = useState<Upload[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch upload history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.uploads);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUploadComplete = async (imageUrl: string, theme?: string) => {
    // Show product selector after upload
    setCurrentImageUrl(imageUrl);
    setCurrentMockups({});
    setCurrentUploadId(null);
  };

  const handleMockupsGenerated = (mockups: Record<string, string>, uploadId?: string) => {
    setCurrentMockups(mockups);
    if (uploadId) {
      setCurrentUploadId(uploadId);
    }
    // Refresh history
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(uploadId));

    try {
      const response = await fetch(`/api/history/${uploadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete upload');
      }

      // Remove from history state
      setHistory(prev => prev.filter(upload => upload.id !== uploadId));

      // If the deleted upload is currently being viewed, clear it
      if (currentUploadId === uploadId) {
        setCurrentImageUrl(null);
        setCurrentMockups({});
        setCurrentUploadId(null);
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Failed to delete upload. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Merchify
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-normal text-gray-700 dark:text-gray-300"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create Your Mockups
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Upload your image and select products to generate professional mockups
          </p>
        </header>

        {/* Upload Section */}
        {!currentImageUrl && (
          <section className="max-w-2xl mx-auto mb-24">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Media</h2>
            </div>
            <MediaUpload onUploadComplete={handleUploadComplete} />
          </section>
        )}

        {/* Product Selector - Shows after upload */}
        {currentImageUrl && (
          <section className="max-w-6xl mx-auto mb-24">
            <ProductSelector
              imageUrl={currentImageUrl}
              onMockupsGenerated={handleMockupsGenerated}
              existingMockups={currentMockups}
            />
            
            {/* Start New Upload Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setCurrentImageUrl(null);
                  setCurrentMockups({});
                  setCurrentUploadId(null);
                }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-normal text-gray-700 dark:text-gray-300"
              >
                Start New Upload
              </button>
            </div>
          </section>
        )}

        {/* Mockup Display */}
        {Object.keys(currentMockups).length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-800 my-16 max-w-6xl mx-auto"></div>
            <section className="max-w-6xl mx-auto mb-24">
              <MockupDisplay 
                mockups={currentMockups} 
                isLoading={false}
                uploadId={currentUploadId || undefined}
              />
            </section>
          </>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-800 my-16 max-w-6xl mx-auto"></div>
            <section className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Uploads</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((upload) => (
                  <div
                    key={upload.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="aspect-square relative bg-gray-50 dark:bg-gray-900">
                      <img
                        src={upload.original_image_url}
                        alt="Generated image"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteUpload(upload.id)}
                        disabled={deletingIds.has(upload.id)}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                        title="Delete upload"
                      >
                        {deletingIds.has(upload.id) ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {formatDate(upload.created_at)}
                      </p>
                      
                      <button
                        onClick={() => {
                          setCurrentImageUrl(upload.original_image_url);
                          setCurrentMockups(upload.mockup_urls);
                          setCurrentUploadId(upload.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-normal"
                      >
                        View & Add More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {isLoadingHistory && history.length === 0 && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading history...</p>
          </div>
        )}

        {!isLoadingHistory && history.length === 0 && !currentImageUrl && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No uploads yet. Upload an image to get started.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-24 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Merchify v0.1</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Powered by Vercel, Supabase, and Printful</p>
        </div>
      </footer>
    </div>
  );
}

