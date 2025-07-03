
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface AddDoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDoctorForm: React.FC<AddDoctorFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    bio: '',
    photoUrl: '',
    email: '',
    password: '',
    isExpert: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      bio: '',
      photoUrl: '',
      email: '',
      password: '',
      isExpert: false
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      photoUrl: imageUrl
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Doctor name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.specialty.trim()) {
      toast({
        title: "Validation Error", 
        description: "Specialty is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.bio.trim()) {
      toast({
        title: "Validation Error",
        description: "Bio is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Valid email is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const doctorUid = userCredential.user.uid;

      // Create doctor document
      await setDoc(doc(db, 'doctors', doctorUid), {
        name: formData.name,
        specialty: formData.specialty,
        bio: formData.bio,
        photoUrl: formData.photoUrl || '',
        email: formData.email,
        isExpert: formData.isExpert,
        createdAt: Timestamp.now()
      });

      // Create user profile document
      await setDoc(doc(db, 'users', doctorUid), {
        uid: doctorUid,
        email: formData.email,
        role: 'doctor',
        name: formData.name,
        createdAt: Timestamp.now()
      });

      toast({
        title: "Success!",
        description: `Dr. ${formData.name} has been added successfully.`,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add doctor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Add New Doctor
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 mt-6"
        >
          <div className="flex justify-center">
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={formData.photoUrl}
              label="Doctor Profile Photo"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Doctor Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter doctor's full name"
                disabled={isSubmitting}
                className="w-full"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
                Specialty *
              </Label>
              <Input
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="e.g., Cardiology, Orthopedics"
                disabled={isSubmitting}
                className="w-full"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Bio & Experience *
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Doctor's background, qualifications, and experience"
              disabled={isSubmitting}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="doctor@rajakumari.com"
                disabled={isSubmitting}
                className="w-full"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Temporary Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={isSubmitting}
                className="w-full"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="isExpert"
              checked={formData.isExpert}
              onCheckedChange={(checked) => handleInputChange('isExpert', !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isExpert" className="text-sm font-medium text-gray-700 cursor-pointer">
              Mark as Expert Doctor
            </Label>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-medical-600 hover:bg-medical-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Doctor</span>
                </div>
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorForm;
