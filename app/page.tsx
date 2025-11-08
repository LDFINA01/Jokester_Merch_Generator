'use client';

import { useState, useEffect } from 'react';
import MediaUpload from './components/MediaUpload';
import MockupDisplay from './components/MockupDisplay';

interface Upload {
  id: string;
  created_at: string;
  original_image_url: string;
  mockup_urls: {
    mug: string;
    shirt: string;
  };
  theme?: string;
}

export default function Home() {
  const [currentMockups, setCurrentMockups] = useState<{
    mug: string;
    shirt: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Upload[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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
    setIsGenerating(true);
    setCurrentMockups(null);

    try {
      const response = await fetch('/api/mockups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl,
          theme: theme || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mockups');
      }

      const data = await response.json();
      setCurrentMockups(data.mockups);
      
      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Error generating mockups:', error);
      alert('Failed to generate mockups. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Jokester Merch Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Turn your videos into custom merchandise in seconds
          </p>
        </header>

        {/* Upload Section */}
        <section className="max-w-2xl mx-auto mb-16">
          <MediaUpload onUploadComplete={handleUploadComplete} />
        </section>

        {/* Mockup Display */}
        {(isGenerating || currentMockups) && (
          <section className="max-w-6xl mx-auto mb-16">
            <MockupDisplay mockups={currentMockups} isLoading={isGenerating} />
          </section>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <section className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Recent Uploads</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((upload) => (
                <div
                  key={upload.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-900">
                    <img
                      src={upload.original_image_url}
                      alt="Generated image"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {formatDate(upload.created_at)}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentMockups(upload.mockup_urls)}
                        className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Mockups
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isLoadingHistory && history.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading history...</p>
          </div>
        )}

        {!isLoadingHistory && history.length === 0 && !currentMockups && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No uploads yet. Upload a video to get started!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>Jokester Merch Generator v0.1 - Video to Merch</p>
          <p className="text-sm mt-2">Powered by Vercel, Supabase, and Printful</p>
        </div>
      </footer>
    </div>
  );
}

