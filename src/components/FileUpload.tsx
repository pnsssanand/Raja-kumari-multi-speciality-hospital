
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  accept: string;
  onFileSelect: (file: File) => void;
  uploading: boolean;
  currentFileUrl?: string;
  onRemove?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onFileSelect,
  uploading,
  currentFileUrl,
  onRemove
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileType = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = allowedTypes.some(type => 
      type === fileType || type === mimeType || 
      (type.includes('/*') && mimeType.startsWith(type.replace('/*', '')))
    );

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid file format.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentFileUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm">File uploaded</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(currentFileUrl, '_blank')}
                >
                  View
                </Button>
                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id={`file-upload-${label}`}
            disabled={uploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
