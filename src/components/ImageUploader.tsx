import React, { useState, useCallback } from 'react';
import { uploadImage } from '../services/storageService.ts';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon.tsx';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  storagePath: string; // e.g., 'user-avatars'
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete, storagePath }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const downloadURL = await uploadImage(file, storagePath);
      onUploadComplete(downloadURL);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, storagePath]);

  return (
    <div>
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors">
          <div className="space-y-1 text-center">
            <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
      </label>
      {isUploading && <p className="mt-2 text-sm text-center text-gray-500">Uploading...</p>}
      {error && <p className="mt-2 text-sm text-center text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploader;
