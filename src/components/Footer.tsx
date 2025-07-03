
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'Appointments', href: '#appointments' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    'Emergency Care',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'General Medicine',
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hospital Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Raja Kumari</h3>
                <p className="text-gray-400 text-sm">Multi Speciality Hospital</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Providing world-class healthcare services with compassion, 
              innovation, and excellence for over a decade.
            </p>
            <div className="flex items-center space-x-2 text-medical-400">
              <Heart className="h-5 w-5" />
              <span className="text-sm">Caring for your health, always</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-medical-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-400">{service}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-medical-400 mt-0.5" />
                <div>
                  <p className="text-gray-400">
                    123 Healthcare Street<br />
                    Medical District<br />
                    Hyderabad, Telangana 500001
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-medical-400" />
                <div>
                  <p className="text-gray-400">+91 98765 43210</p>
                  <p className="text-gray-500 text-sm">24/7 Emergency</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-medical-400" />
                <p className="text-gray-400">info@rajakumarihospital.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-medical-400" />
                <div>
                  <p className="text-gray-400">Mon-Sat: 8AM-10PM</p>
                  <p className="text-gray-500 text-sm">Sunday: 9AM-6PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="border-t border-gray-800 mt-12 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-4">
            <p className="text-gray-400">
              © 2024 Raja Kumari Multi Speciality Hospital. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Built with care for better healthcare
            </p>
          </div>
          
          {/* Developer Credit */}
          <div className="text-center pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Website designed and developed by <strong className="text-medical-400">Mr. Anand Pinisetty</strong><br />
              from <strong className="text-medical-400">Dream Team Pvt. Ltd.</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
