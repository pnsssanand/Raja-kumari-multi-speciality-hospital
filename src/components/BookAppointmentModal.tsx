
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoctorId?: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDoctorId 
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    doctorId: selectedDoctorId || '',
    date: undefined as Date | undefined,
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const doctorsCollection = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
    }
  });

  // Update doctorId when selectedDoctorId changes
  React.useEffect(() => {
    if (selectedDoctorId) {
      setFormData(prev => ({ ...prev, doctorId: selectedDoctorId }));
    }
  }, [selectedDoctorId]);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.email || !formData.phone || 
        !formData.doctorId || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDoctor = doctors?.find(d => d.id === formData.doctorId);
      
      await addDoc(collection(db, 'appointments'), {
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        doctorId: formData.doctorId,
        doctorName: selectedDoctor?.name || '',
        doctorSpecialty: selectedDoctor?.specialty || '',
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with Dr. ${selectedDoctor?.name} has been scheduled successfully. We'll contact you soon.`,
      });

      // Reset form
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        doctorId: selectedDoctorId || '',
        date: undefined,
        time: '',
        notes: ''
      });

      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-medical-600" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              required
            />
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label>Select Doctor *</Label>
            <Select 
              value={formData.doctorId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Dr. {doctor.name} - {doctor.specialty}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Appointment Time *</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any specific concerns or additional information..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-medical-600 hover:bg-medical-700"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentModal;
