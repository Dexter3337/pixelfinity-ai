
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

const ImageUploader = ({ onImageSelected }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    processFiles(files);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const processFiles = (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check file size (limit to 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image is too large. Please upload an image smaller than 10 MB.');
      return;
    }
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Pass the file to the parent component
    onImageSelected(file);
    
    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />
      
      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 transition-colors ${
            isDragging
              ? 'bg-blue-50 border-blue-300'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Drag & Drop Your Image</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Upload an image to enhance. We support JPG, PNG, and WEBP formats up to 10 MB.
            </p>
            <Button
              onClick={handleBrowseClick}
              variant="outline"
              className="rounded-full"
            >
              <Image className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 animate-fade-in">
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-10 rounded-full w-8 h-8 p-0"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto max-h-[500px] object-contain p-2"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
