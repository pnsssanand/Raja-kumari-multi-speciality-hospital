
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { uploadImageToCloudinary, validateImageFile } from '@/utils/cloudinaryUpload';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ServiceImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({
  imageUrl,
  onImageChange,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Show preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploading(true);
      
      toast({
        title: "Uploading Image",
        description: "Please wait while we upload your image..."
      });

      const uploadedUrl = await uploadImageToCloudinary(file);
      
      onImageChange(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      
      toast({
        title: "Image Uploaded Successfully",
        description: "Your service image has been uploaded and saved."
      });

    } catch (error) {
      console.error('Upload failed:', error);
      
      // Revert preview on error
      setPreviewUrl(imageUrl);
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Clean up local preview URL
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    onImageChange('');
    toast({
      title: "Image Removed",
      description: "Service image has been removed."
    });
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="service-image" className="text-sm font-medium">
        Service Image
      </Label>
      
      <div className="flex flex-col space-y-4">
        {/* Image Preview */}
        {previewUrl ? (
          <div className="relative w-full max-w-xs mx-auto">
            <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
              <img
                src={previewUrl}
                alt="Service preview"
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs mx-auto aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No image selected</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {!disabled && (
          <div className="flex justify-center">
            <label htmlFor="service-image-input" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="w-full sm:w-auto"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
                </span>
              </Button>
            </label>
            <input
              id="service-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, WebP (max 5MB)
        </p>
      </div>
    </div>
  );
};

export default ServiceImageUpload;
