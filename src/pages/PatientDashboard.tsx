
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientReports from '@/components/PatientReports';
import { Calendar as CalendarIcon, MessageCircle, User2, Stethoscope, Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  requestedTime: any;
  confirmedTime?: any;
  status: 'pending' | 'confirmed' | 'completed' | 'rescheduled';
  notes?: string;
  doctorName?: string;
  doctorComment?: string;
  progressReportUrl?: string;
  prescriptionUrl?: string;
  reportUploadedAt?: any;
  createdAt?: any;
}

interface AppointmentUpdate {
  id: string;
  type: 'confirmed' | 'rescheduled' | 'completed';
  message: string;
  timestamp: any;
  appointmentId: string;
}

const PatientDashboard = () => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [updates, setUpdates] = useState<AppointmentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time appointments listener
  useEffect(() => {
    if (!userProfile?.uid) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', userProfile.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appointmentsWithDoctors = await Promise.all(
        snapshot.docs.map(async (appointmentDoc) => {
          const appointmentData = { id: appointmentDoc.id, ...appointmentDoc.data() } as Appointment;
          
          // Fetch doctor name
          try {
            const doctorDoc = await getDoc(doc(db, 'doctors', appointmentData.doctorId));
            if (doctorDoc.exists()) {
              appointmentData.doctorName = doctorDoc.data().name;
            }
          } catch (error) {
            console.log('Error fetching doctor info:', error);
          }
          
          return appointmentData;
        })
      );
      
      setAppointments(appointmentsWithDoctors);
      
      // Generate updates from appointment changes
      const newUpdates: AppointmentUpdate[] = [];
      appointmentsWithDoctors.forEach((appointment) => {
        if (appointment.status === 'confirmed' && appointment.confirmedTime) {
          newUpdates.push({
            id: `${appointment.id}-confirmed`,
            type: 'confirmed',
            message: `Your appointment with Dr. ${appointment.doctorName} has been confirmed for ${format(appointment.confirmedTime.toDate(), 'PPP p')}`,
            timestamp: appointment.confirmedTime,
            appointmentId: appointment.id
          });
        } else if (appointment.status === 'rescheduled' && appointment.confirmedTime) {
          newUpdates.push({
            id: `${appointment.id}-rescheduled`,
            type: 'rescheduled',
            message: `Your appointment with Dr. ${appointment.doctorName} has been rescheduled to ${format(appointment.confirmedTime.toDate(), 'PPP p')}`,
            timestamp: appointment.confirmedTime,
            appointmentId: appointment.id
          });
        } else if (appointment.status === 'completed') {
          newUpdates.push({
            id: `${appointment.id}-completed`,
            type: 'completed',
            message: `Your appointment with Dr. ${appointment.doctorName} has been completed`,
            timestamp: appointment.createdAt || new Date(),
            appointmentId: appointment.id
          });
        }
      });
      
      setUpdates(newUpdates.sort((a, b) => b.timestamp?.toDate?.() - a.timestamp?.toDate?.() || 0));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

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

  const getAppointmentMessage = (appointment: Appointment) => {
    if (appointment.status === 'rescheduled' && appointment.confirmedTime) {
      return (
        <div className="text-sm text-blue-600 mt-1">
          Rescheduled to {format(appointment.confirmedTime.toDate(), 'PPP p')}
        </div>
      );
    }
    if (appointment.status === 'confirmed' && appointment.confirmedTime) {
      return (
        <div className="text-sm text-green-600 mt-1">
          Confirmed for {format(appointment.confirmedTime.toDate(), 'PPP p')}
        </div>
      );
    }
    return null;
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'confirmed':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'rescheduled':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'completed':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
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
              Patient <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600">
              Track your appointments, progress, and medical reports
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* My Appointments & Updates Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2" />
                    📅 My Appointments & Updates
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="appointments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="appointments">My Appointments</TabsTrigger>
                      <TabsTrigger value="updates" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Updates
                        {updates.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                            {updates.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="appointments" className="space-y-4 mt-6">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Loading appointments...</p>
                        </div>
                      ) : appointments && appointments.length > 0 ? (
                        appointments.map(appointment => (
                          <Card key={appointment.id} className="border-l-4 border-l-medical-500">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      Dr. {appointment.doctorName || 'Unknown'}
                                    </h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <CalendarIcon className="w-4 h-4" />
                                      <span>
                                        {appointment.requestedTime?.toDate ? 
                                          format(appointment.requestedTime.toDate(), 'PPP p') : 
                                          'Not specified'
                                        }
                                      </span>
                                    </div>
                                    {getAppointmentMessage(appointment)}
                                  </div>
                                </div>
                                {getStatusBadge(appointment.status)}
                              </div>

                              {/* Doctor Comment */}
                              {appointment.doctorComment && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                  <div className="flex items-start space-x-2">
                                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-blue-900 mb-1">Doctor's Feedback</p>
                                      <p className="text-blue-800">{appointment.doctorComment}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Appointment Notes */}
                              {appointment.notes && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Appointment Notes:</p>
                                  <p className="text-sm text-gray-600">{appointment.notes}</p>
                                </div>
                              )}

                              {/* Reports indicators */}
                              {(appointment.progressReportUrl || appointment.prescriptionUrl) && (
                                <div className="flex items-center space-x-4 text-sm">
                                  {appointment.progressReportUrl && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                      <span>Progress Report Available</span>
                                    </div>
                                  )}
                                  {appointment.prescriptionUrl && (
                                    <div className="flex items-center space-x-1 text-blue-600">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                      <span>Prescription Available</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                          <p className="text-gray-500">Your upcoming and past appointments will appear here.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="updates" className="space-y-4 mt-6">
                      {updates.length > 0 ? (
                        updates.map(update => (
                          <div key={update.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            {getUpdateIcon(update.type)}
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{update.message}</p>
                              <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {update.timestamp?.toDate ? 
                                    format(update.timestamp.toDate(), 'PPP p') : 
                                    'Recently'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h3>
                          <p className="text-gray-500">Updates from your doctors will appear here.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reports Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {appointments && (
                <PatientReports appointments={appointments} />
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
