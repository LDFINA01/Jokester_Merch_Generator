'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';

interface MediaUploadProps {
  onUploadComplete: (imageUrl: string, theme?: string) => void;
}

export default function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [theme, setTheme] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/avi'];
    
    if (uploadType === 'image') {
      if (!validImageTypes.includes(file.type)) {
        return 'Please upload a JPEG or PNG image.';
      }
      const maxSize = 10 * 1024 * 1024; // 10MB for images
      if (file.size > maxSize) {
        return 'Image file size must be less than 10MB.';
      }
    } else {
      if (!validVideoTypes.includes(file.type)) {
        return 'Please upload a MP4, MOV, or AVI video.';
      }
      const maxSize = 100 * 1024 * 1024; // 100MB for videos
      if (file.size > maxSize) {
        return 'Video file size must be less than 100MB.';
      }
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (uploadType === 'image') {
        // Direct image upload - instant processing
        setProcessingStage('Uploading image...');
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        setProcessingStage('Generating mockups...');
        onUploadComplete(data.url); // No theme for images
      } else {
        // Video processing - longer flow
        if (theme.trim()) {
          formData.append('theme', theme.trim());
        }
        setProcessingStage('Uploading video to cloud storage...');
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        setProcessingStage('Processing video (this may take 30-60 seconds)...');
        const data = await response.json();
        
        setProcessingStage('Generating mockups...');
        onUploadComplete(data.url, theme || undefined); // Pass theme for videos
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setPreview(null);
    } finally {
      setIsUploading(false);
      setProcessingStage(null);
    }
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview
    setPreview(URL.createObjectURL(file));

    // Upload file
    uploadFile(file);
  };

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const getAcceptTypes = () => {
    if (uploadType === 'image') {
      return 'image/jpeg,image/png,image/jpg';
    }
    return 'video/mp4,video/quicktime,video/avi';
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Type Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Type:
        </span>
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => {
              setUploadType('image');
              setPreview(null);
              setError(null);
            }}
            disabled={isUploading}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              uploadType === 'image'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadType('video');
              setPreview(null);
              setError(null);
            }}
            disabled={isUploading}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              uploadType === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Theme Input - Only show for video uploads */}
      {uploadType === 'video' && (
        <div>
          <label htmlFor="theme-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
            Theme (Optional)
          </label>
          <input
            type="text"
            id="theme-input"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Funny, Motivational, Sarcastic..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isUploading}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Add a theme to customize your merch style
          </p>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={getAcceptTypes()}
          onChange={handleFileInput}
          disabled={isUploading}
        />

        {preview ? (
          <div className="space-y-4">
            {uploadType === 'image' ? (
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
              />
            ) : (
              <video
                src={preview}
                controls
                muted
                playsInline
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
            )}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {processingStage || 'Processing...'}
                  </p>
                </div>
                {uploadType === 'video' && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      This includes transcription, moment detection, and AI image generation
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Please wait, this may take up to 2 minutes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              {uploadType === 'image' ? (
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M16 4v24l20-12L16 4z"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <div className="text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload {uploadType === 'image' ? 'an image' : 'a video'}</span>
              </label>
              <p className="pl-1 inline">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {uploadType === 'image' 
                ? 'JPEG or PNG only (up to 10MB)' 
                : 'MP4, MOV, or AVI (up to 100MB)'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

