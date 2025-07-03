
import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import DoctorsSection from '@/components/DoctorsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <DoctorsSection />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;
