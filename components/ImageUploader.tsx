
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import type { MimeType } from '../types';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: MimeType) => void;
  disabled?: boolean;
}

const SUPPORTED_MIME_TYPES: MimeType[] = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    if (!SUPPORTED_MIME_TYPES.includes(file.type as MimeType)) {
      setError(`Unsupported file type. Please use PNG, JPEG, WEBP, HEIC, or HEIF.`);
      setPreview(null);
      return;
    }
    
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64 = result.split(',')[1];
      onImageUpload(base64, file.type as MimeType);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const triggerFileSelect = () => {
      if(fileInputRef.current) {
        fileInputRef.current.click();
      }
  };

  return (
    <div>
       <label className="block text-sm font-medium text-gray-300 mb-2">
        Source Image
      </label>
      <div
        className={`relative w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center text-center p-4 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-gray-800 cursor-pointer'}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={SUPPORTED_MIME_TYPES.join(',')}
          onChange={onFileInputChange}
          disabled={disabled}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
          <div className="text-gray-400">
            <UploadIcon />
            <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP, etc.</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};
