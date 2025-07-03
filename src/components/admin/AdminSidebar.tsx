
import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Briefcase, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen 
}) => {
  const menuItems = [
    { id: 'doctors', label: 'Doctors', icon: UserCheck, color: 'text-blue-600' },
    { id: 'services', label: 'Services', icon: Briefcase, color: 'text-green-600' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, color: 'text-purple-600' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-orange-600' },
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    // Always close mobile menu after selection for better UX
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white shadow-lg border-medical-200 hover:bg-medical-50"
        >
          <Menu className="w-5 h-5" />
          <span>Admin Menu</span>
        </Button>
      </div>

      {/* Mobile Overlay - Improved with backdrop blur */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Enhanced animations and positioning */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0.95,
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0.0, 0.2, 1], // Custom easing for smoother animation
          opacity: { duration: 0.2 }
        }}
        className={`
          fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 
          lg:relative lg:translate-x-0 lg:opacity-100 lg:shadow-lg lg:rounded-lg lg:max-w-none
          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100'}
        `}
      >
        <Card className="h-full border-0 lg:border overflow-hidden">
          {/* Header - Enhanced styling */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-medical-50 to-white lg:justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center">
                <Menu className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Admin Menu</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden hover:bg-medical-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Menu Items - Enhanced with better animations */}
          <div className="p-4 space-y-1">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: activeTab === item.id ? 1.02 : 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3
                }}
                whileHover={{ 
                  scale: activeTab === item.id ? 1.02 : 1.05,
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-300
                  ${activeTab === item.id 
                    ? 'bg-medical-100 border-l-4 border-medical-600 text-medical-700 shadow-md' 
                    : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm hover:border-l-4 hover:border-gray-300'
                  }
                `}
              >
                <motion.div
                  animate={{ 
                    rotate: activeTab === item.id ? 360 : 0,
                    scale: activeTab === item.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-medical-600' : item.color}`} />
                </motion.div>
                <span className="font-medium text-left">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-auto w-2 h-2 bg-medical-600 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Footer - Optional admin info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50/50">
            <div className="text-xs text-gray-500 text-center">
              Admin Dashboard v1.0
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminSidebar;
