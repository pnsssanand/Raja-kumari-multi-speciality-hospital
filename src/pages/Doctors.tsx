
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookAppointmentModal from '@/components/BookAppointmentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, User, Calendar, Star } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl?: string;
  availability?: string[];
}

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { data: doctors, isLoading, error } = useQuery({
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

  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(doctors?.map(doctor => doctor.specialty) || [])];

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctor(null);
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
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our <span className="gradient-text">Expert Doctors</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team of experienced medical professionals is dedicated to providing you with the best care
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="hover-lift h-[480px]">
                  <CardHeader className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-red-500 text-xl mb-4">Error loading doctors</div>
              <p className="text-gray-600">Please try again later</p>
            </motion.div>
          ) : !filteredDoctors || filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="w-16 h-16 text-medical-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {doctors?.length === 0 ? 'No Doctors Available' : 'No Doctors Found'}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {doctors?.length === 0 
                  ? 'Our medical team information is being updated. Please check back soon.'
                  : 'Try adjusting your search criteria to find more doctors.'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-[480px] hover-lift cursor-pointer group transition-all duration-300 hover:shadow-2xl flex flex-col">
                    <CardHeader className="text-center pb-4 flex-shrink-0">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-medical-100">
                        {doctor.photoUrl ? (
                          <img 
                            src={doctor.photoUrl} 
                            alt={doctor.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-medical-600" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-medical-600 transition-colors">
                        Dr. {doctor.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-medical-100 text-medical-700 hover:bg-medical-200">
                        {doctor.specialty}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center flex-1 flex flex-col justify-between">
                      <div className="flex-1 mb-4">
                        <CardDescription className="text-gray-600 text-sm leading-relaxed overflow-hidden" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          maxHeight: '5rem'
                        }}>
                          {doctor.bio}
                        </CardDescription>
                      </div>
                      
                      <div className="space-y-3 flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              View Full Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-gray-900">
                                Dr. {doctor.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="text-center">
                                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-medical-100">
                                  {doctor.photoUrl ? (
                                    <img 
                                      src={doctor.photoUrl} 
                                      alt={doctor.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User className="w-16 h-16 text-medical-600" />
                                    </div>
                                  )}
                                </div>
                                <Badge variant="secondary" className="bg-medical-100 text-medical-700">
                                  {doctor.specialty}
                                </Badge>
                              </div>
                              <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold mb-4">About</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{doctor.bio}</p>
                                
                                {doctor.availability && doctor.availability.length > 0 && (
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                      <Calendar className="w-5 h-5 mr-2" />
                                      Availability
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                      {doctor.availability.map((day, index) => (
                                        <Badge key={index} variant="outline">
                                          {day}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <Button 
                                  className="w-full bg-medical-600 hover:bg-medical-700 text-white"
                                  onClick={() => handleBookAppointment(doctor)}
                                >
                                  Book Appointment
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          className="w-full bg-medical-600 hover:bg-medical-700 text-white"
                          onClick={() => handleBookAppointment(doctor)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        selectedDoctorId={selectedDoctor?.id}
      />
    </div>
  );
};

export default Doctors;
