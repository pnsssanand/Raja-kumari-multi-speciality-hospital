
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    doctorId: '',
    date: undefined as Date | undefined,
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const doctorsCollection = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        specialty: doc.data().specialty
      })) as Doctor[];
    }
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        dateTime: Timestamp.fromDate(new Date(`${format(formData.date, 'yyyy-MM-dd')} ${formData.time}`)),
        notes: formData.notes,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      toast({
        title: "Appointment Booked Successfully!",
        description: `Your appointment with Dr. ${selectedDoctor?.name} has been scheduled for ${format(formData.date, 'PPP')} at ${formData.time}.`,
      });

      // Reset form
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        doctorId: '',
        date: undefined,
        time: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Book an <span className="gradient-text">Appointment</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Schedule your consultation with our expert medical team
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-medical-500 to-medical-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-3" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Patient Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="patientName" className="flex items-center text-sm font-medium">
                        <User className="w-4 h-4 mr-2" />
                        Patient Name *
                      </Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center text-sm font-medium">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor" className="flex items-center text-sm font-medium">
                        <User className="w-4 h-4 mr-2" />
                        Select Doctor *
                      </Label>
                      <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctorsLoading ? (
                            <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                          ) : doctors && doctors.length > 0 ? (
                            doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name} - {doctor.specialty}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-doctors" disabled>No doctors available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center text-sm font-medium">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Select Date *
                      </Label>
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
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center text-sm font-medium">
                        <Clock className="w-4 h-4 mr-2" />
                        Select Time *
                      </Label>
                      <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="flex items-center text-sm font-medium">
                      <FileText className="w-4 h-4 mr-2" />
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any specific concerns or information you'd like to share..."
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-medical-600 hover:bg-medical-700 text-white py-4 text-lg font-semibold"
                  >
                    {isSubmitting ? "Booking Appointment..." : "Book Appointment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointment;
