
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase } from 'lucide-react';
import DoctorsManagement from '@/components/admin/DoctorsManagement';
import ServicesManagement from '@/components/admin/ServicesManagement';
import AppointmentsViewer from '@/components/admin/AppointmentsViewer';
import UsersManagement from '@/components/admin/UsersManagement';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  services: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [stats, setStats] = useState<Stats>({
    doctors: 0,
    patients: 0,
    appointments: 0,
    services: 0
  });

  // Real-time stats listeners
  useEffect(() => {
    console.log('Setting up real-time listeners for admin stats');

    // Doctors listener
    const unsubscribeDoctors = onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        const count = snapshot.size;
        console.log('Doctors count updated:', count);
        setStats(prev => ({ ...prev, doctors: count }));
      },
      (error) => console.error('Error listening to doctors:', error)
    );

    // Users (patients) listener - filtering for role 'patient'
    const unsubscribePatients = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const patientCount = snapshot.docs.filter(doc => 
          doc.data().role === 'user' || doc.data().role === 'patient'
        ).length;
        console.log('Patients count updated:', patientCount);
        setStats(prev => ({ ...prev, patients: patientCount }));
      },
      (error) => console.error('Error listening to patients:', error)
    );

    // Appointments listener
    const unsubscribeAppointments = onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        const count = snapshot.size;
        console.log('Appointments count updated:', count);
        setStats(prev => ({ ...prev, appointments: count }));
      },
      (error) => console.error('Error listening to appointments:', error)
    );

    // Services listener
    const unsubscribeServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const count = snapshot.size;
        console.log('Services count updated:', count);
        setStats(prev => ({ ...prev, services: count }));
      },
      (error) => console.error('Error listening to services:', error)
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeDoctors();
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribeServices();
    };
  }, []);

  const statsCards = [
    { 
      title: 'Total Doctors', 
      value: stats.doctors.toString(), 
      icon: UserCheck, 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Total Patients', 
      value: stats.patients.toString(), 
      icon: Users, 
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    { 
      title: 'Total Appointments', 
      value: stats.appointments.toString(), 
      icon: Calendar, 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Total Services', 
      value: stats.services.toString(), 
      icon: Briefcase, 
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-600'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'doctors':
        return <DoctorsManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'appointments':
        return <AppointmentsViewer />;
      case 'users':
        return <UsersManagement />;
      default:
        return <DoctorsManagement />;
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Dashboard Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your hospital's operations
              </p>
            </motion.div>

            {/* Real-Time Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
            >
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group"
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-2 truncate">{stat.title}</p>
                          <motion.p 
                            key={stat.value}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl md:text-3xl font-bold text-gray-900"
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-4`}>
                          <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <div className={`w-2 h-2 ${stat.color} rounded-full mr-2 animate-pulse`}></div>
                        <span className="text-xs text-gray-500">Live data</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">
                  {activeTab} Management
                </h2>
              </div>
              
              <div className="p-4 md:p-6">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
