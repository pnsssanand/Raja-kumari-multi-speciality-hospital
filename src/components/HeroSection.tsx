
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BookAppointmentModal from './BookAppointmentModal';

const HeroSection = () => {
  const { currentUser } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-50 via-white to-medical-100"></div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-medical-200/30 rounded-full blur-xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-20 w-32 h-32 bg-medical-300/20 rounded-full blur-xl"
            animate={{
              y: [0, 20, 0],
              x: [0, -15, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-medical-400/25 rounded-full blur-xl"
            animate={{
              y: [0, -15, 0],
              x: [0, 20, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              className="text-center lg:text-left order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Your Health, 
                <span className="gradient-text block">Our Priority</span>
              </motion.h1>
              
              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Experience world-class healthcare with our team of expert doctors, 
                state-of-the-art facilities, and compassionate care that puts you first.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {/* Highlighted Book Appointment Button */}
                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full sm:w-auto bg-medical-600 hover:bg-medical-700 text-white px-6 lg:px-8 py-3 rounded-full text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-medical-500 to-medical-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Book Appointment
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-medical-600 text-medical-600 hover:bg-medical-50 px-6 lg:px-8 py-3 rounded-full text-base lg:text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Emergency: 24/7
                </Button>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                className="grid grid-cols-3 gap-4 lg:gap-6 text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-medical-600">15+</div>
                  <div className="text-xs lg:text-sm text-gray-600">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-medical-600">24/7</div>
                  <div className="text-xs lg:text-sm text-gray-600">Emergency Care</div>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-medical-600">5000+</div>
                  <div className="text-xs lg:text-sm text-gray-600">Happy Patients</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Image/Visual */}
            <motion.div
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                {/* Main image placeholder */}
                <div className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] bg-gradient-to-br from-medical-100 to-medical-200 rounded-3xl shadow-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Modern hospital facility"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                
                {/* Floating info cards */}
                <motion.div
                  className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success-500 rounded-full flex items-center justify-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">24/7 Available</div>
                      <div className="text-xs text-gray-600 hidden sm:block">Emergency Services</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-medical-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">Prime Location</div>
                      <div className="text-xs text-gray-600 hidden sm:block">Easy Access</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Book Appointment Modal */}
      <BookAppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
