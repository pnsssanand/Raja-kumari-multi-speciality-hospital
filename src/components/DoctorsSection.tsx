
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookAppointmentModal from '@/components/BookAppointmentModal';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl?: string;
  isExpert?: boolean;
  availability?: string[];
}

const DoctorsSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const { data: expertDoctors, isLoading } = useQuery({
    queryKey: ['expertDoctors'],
    queryFn: async () => {
      const doctorsCollection = collection(db, 'doctors');
      const expertQuery = query(doctorsCollection, where('isExpert', '==', true));
      const snapshot = await getDocs(expertQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
    }
  });

  const handleBookAppointment = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctorId('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <>
      <section id="doctors" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="gradient-text">Expert Doctors</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team of highly qualified and experienced doctors are committed to 
              providing you with the best possible healthcare.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[520px]">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : expertDoctors && expertDoctors.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {expertDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover-lift border-0 shadow-lg bg-white h-[520px] flex flex-col">
                    <div className="relative">
                      <div className="h-64 bg-gradient-to-br from-medical-100 to-medical-200 overflow-hidden">
                        {doctor.photoUrl ? (
                          <img
                            src={doctor.photoUrl}
                            alt={doctor.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-16 h-16 text-medical-600" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-900">Expert</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. {doctor.name}</h3>
                      <div className="text-medical-600 font-semibold mb-1">{doctor.specialty}</div>
                      <div className="text-gray-600 text-sm mb-4 flex-1 overflow-hidden" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        maxHeight: '4.5rem'
                      }}>
                        {doctor.bio}
                      </div>
                      
                      {doctor.availability && doctor.availability.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{doctor.availability.join(', ')}</span>
                        </div>
                      )}

                      <Button 
                        onClick={() => handleBookAppointment(doctor.id)}
                        className="w-full bg-medical-600 hover:bg-medical-700 text-white rounded-full mt-auto"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-medical-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Expert Doctors Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our expert doctors information is being updated. Please check back soon or contact us.
              </p>
            </motion.div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="outline" 
              className="border-medical-600 text-medical-600 hover:bg-medical-50 px-8 py-3 rounded-full text-lg font-semibold"
            >
              View All Doctors
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        selectedDoctorId={selectedDoctorId}
      />
    </>
  );
};

export default DoctorsSection;
