
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  Menu, 
  X, 
  UserCheck, 
  Briefcase, 
  Calendar, 
  Users 
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'doctors', label: 'Doctors', icon: UserCheck },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Hospital Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Raja Kumari</h1>
              <p className="text-xs text-gray-600 -mt-1">Multi Speciality Hospital</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900">Raja Kumari</h1>
            </div>
          </motion.div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white text-medical-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Right Side - Logout Button */}
          <div className="flex items-center space-x-4">
            {/* Desktop Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-medical-50 text-medical-600 border border-medical-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Mobile Logout */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
