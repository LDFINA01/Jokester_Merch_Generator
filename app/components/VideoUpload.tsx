'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';

interface VideoUploadProps {
  onUploadComplete: (imageUrl: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a MP4, MOV, or AVI video.';
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return 'File size must be less than 100MB.';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setProcessingStage('Uploading video...');

    try {
      const formData = new FormData();
      formData.append('file', file);

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
      onUploadComplete(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
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

  return (
    <div className="w-full">
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
          accept="video/mp4,video/quicktime,video/avi"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        {preview ? (
          <div className="space-y-4">
            <video
              src={preview}
              controls
              muted
              playsInline
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {processingStage || 'Processing...'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    This includes transcription, moment detection, and AI image generation
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Please wait, this may take up to 2 minutes
                  </p>
                </div>
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
              <path
                d="M16 4v24l20-12L16 4z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload a video</span>
              </label>
              <p className="pl-1 inline">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
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

