import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import AppointmentReportsManager from '@/components/AppointmentReportsManager';
import { Calendar as CalendarIcon, Clock, User, Edit3, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  requestedTime: any;
  confirmedTime?: any;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  updatedBy?: string;
  progressReportUrl?: string;
  prescriptionUrl?: string;
  reportUploadedAt?: any;
}

const DoctorDashboard = () => {
  const { userProfile } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid) return [];
      
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, where('doctorId', '==', userProfile.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    },
    enabled: !!userProfile?.uid
  });

  const handleReschedule = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time.",
        variant: "destructive"
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        status: 'rescheduled',
        confirmedTime: Timestamp.fromDate(newDateTime),
        updatedBy: 'doctor'
      });

      toast({
        title: "Appointment Rescheduled",
        description: `Appointment moved to ${format(newDateTime, 'PPP p')}`
      });

      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time.",
        variant: "destructive"
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const confirmedDateTime = new Date(selectedDate);
    confirmedDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        status: 'confirmed',
        confirmedTime: Timestamp.fromDate(confirmedDateTime),
        updatedBy: 'doctor'
      });

      toast({
        title: "Appointment Confirmed",
        description: `Appointment confirmed for ${format(confirmedDateTime, 'PPP p')}`
      });

      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      setIsConfirmDialogOpen(false);
      setSelectedAppointment(null);
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'rescheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Rescheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleAppointmentUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Doctor <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600">
              Manage your appointments and patient schedules
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-2" />
                  My Appointments
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Requested Time</TableHead>
                        <TableHead>Confirmed Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading appointments...
                          </TableCell>
                        </TableRow>
                      ) : appointments && appointments.length > 0 ? (
                        appointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-medical-100 flex items-center justify-center">
                                  <User className="w-4 h-4 text-medical-600" />
                                </div>
                                <span className="font-medium">{appointment.patientName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {appointment.requestedTime?.toDate ? 
                                format(appointment.requestedTime.toDate(), 'PPP p') : 
                                'Not specified'
                              }
                            </TableCell>
                            <TableCell>
                              {appointment.confirmedTime?.toDate ? 
                                format(appointment.confirmedTime.toDate(), 'PPP p') : 
                                '-'
                              }
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <AppointmentReportsManager
                                  appointment={appointment}
                                  onAppointmentUpdate={handleAppointmentUpdate}
                                />
                                
                                <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedAppointment(appointment)}
                                    >
                                      <Edit3 className="w-4 h-4 mr-1" />
                                      Reschedule
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reschedule Appointment</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Select Date</label>
                                        <Calendar
                                          mode="single"
                                          selected={selectedDate}
                                          onSelect={setSelectedDate}
                                          className="rounded-md border mt-2"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Select Time</label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                          {timeSlots.map(time => (
                                            <Button
                                              key={time}
                                              variant={selectedTime === time ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => setSelectedTime(time)}
                                            >
                                              {time}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <Button onClick={handleReschedule} className="w-full">
                                        Confirm Reschedule
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => setSelectedAppointment(appointment)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Set Fixed Appointment Time</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Select Date</label>
                                        <Calendar
                                          mode="single"
                                          selected={selectedDate}
                                          onSelect={setSelectedDate}
                                          className="rounded-md border mt-2"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Select Time</label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                          {timeSlots.map(time => (
                                            <Button
                                              key={time}
                                              variant={selectedTime === time ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => setSelectedTime(time)}
                                            >
                                              {time}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700">
                                        Confirm Appointment
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No appointments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
