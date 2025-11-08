'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { Image as ImageIcon, Video, Upload, Loader2 } from 'lucide-react';

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
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
          Upload Type:
        </span>
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => {
              setUploadType('image');
              setPreview(null);
              setError(null);
            }}
            disabled={isUploading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-normal rounded-md transition-colors ${
              uploadType === 'image'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ImageIcon className="w-4 h-4" />
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
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-normal rounded-md transition-colors ${
              uploadType === 'video'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>
      </div>

      {/* Theme Input - Only show for video uploads */}
      {uploadType === 'video' && (
        <div>
          <label htmlFor="theme-input" className="block text-sm font-normal text-gray-600 dark:text-gray-400 mb-2 text-center">
            Theme (Optional)
          </label>
          <input
            type="text"
            id="theme-input"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Funny, Motivational, Sarcastic..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isUploading}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center">
            Add a theme to customize your merch style
          </p>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
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
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-normal text-blue-600 hover:text-blue-700 focus-within:outline-none"
              >
                <span>Upload {uploadType === 'image' ? 'an image' : 'a video'}</span>
              </label>
              <span className="pl-1">or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {uploadType === 'image' 
                ? 'JPEG or PNG only (up to 10MB)' 
                : 'MP4, MOV, or AVI (up to 100MB)'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

