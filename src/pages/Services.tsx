
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Activity, Shield, Users } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;
}

const Services = () => {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const servicesCollection = collection(db, 'services');
      const snapshot = await getDocs(servicesCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
    }
  });

  const defaultIcons = [Heart, Activity, Shield, Users];

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
              Our <span className="gradient-text">Medical Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare services delivered with excellence and compassion
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="hover-lift">
                  <CardHeader>
                    <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4" />
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
              <div className="text-red-500 text-xl mb-4">Error loading services</div>
              <p className="text-gray-600">Please try again later</p>
            </motion.div>
          ) : !services || services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-16 h-16 text-medical-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Services Available</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Our medical services are being updated. Please check back soon or contact us directly.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = defaultIcons[index % defaultIcons.length];
                
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover-lift cursor-pointer group transition-all duration-300 hover:shadow-2xl">
                      <CardHeader className="pb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-medical-500 to-medical-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                          ) : service.iconUrl ? (
                            <img src={service.iconUrl} alt={service.title} className="w-8 h-8" />
                          ) : (
                            <IconComponent className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-medical-600 transition-colors">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
