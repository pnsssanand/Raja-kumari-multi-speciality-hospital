
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ServiceImageUpload from './ServiceImageUpload';

interface ServiceFormData {
  title: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
}

interface ServiceFormProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  onSubmit: () => void;
  submitText: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  submitText
}) => {
  const handleInputChange = (field: keyof ServiceFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Service Image Upload */}
      <div className="space-y-2">
        <ServiceImageUpload
          imageUrl={formData.imageUrl}
          onImageChange={(url) => handleInputChange('imageUrl', url)}
        />
      </div>

      {/* Service Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Service Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Cardiology, Emergency Care"
          className="w-full"
        />
      </div>

      {/* Service Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the service offered"
          rows={4}
          className="w-full resize-none"
        />
      </div>

      {/* Icon URL (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="iconUrl" className="text-sm font-medium">Icon URL (Optional)</Label>
        <Input
          id="iconUrl"
          value={formData.iconUrl}
          onChange={(e) => handleInputChange('iconUrl', e.target.value)}
          placeholder="https://example.com/icon.png"
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Leave empty to use default icon if no image is uploaded
        </p>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={onSubmit} 
        className="w-full bg-medical-600 hover:bg-medical-700 text-white"
        size="lg"
      >
        {submitText}
      </Button>
    </div>
  );
};

export default ServiceForm;
