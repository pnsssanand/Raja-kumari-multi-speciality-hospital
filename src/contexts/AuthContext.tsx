
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'patient' | 'doctor';
  name?: string;
  phone?: string;
  createdAt?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      console.log('Fetching profile for user:', user.email);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        console.log('Found existing profile:', profile);
        setUserProfile(profile);
      } else {
        console.log('Creating new profile for user:', user.email);
        await createUserProfile(user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const isAdmin = user.email === 'admin@rajakumari.com';
    
    // Check if user is a doctor by looking in the doctors collection
    let isDoctor = false;
    try {
      const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));
      isDoctor = doctorDoc.exists();
    } catch (error) {
      console.log('Error checking doctor status:', error);
    }
    
    const role = isAdmin ? 'admin' : isDoctor ? 'doctor' : 'patient';
    console.log('Creating profile for:', user.email, 'Role:', role);
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role,
      createdAt: new Date(),
      ...additionalData
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('Profile created successfully:', userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful, fetching profile...');
    await fetchUserProfile(result.user);
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user, { name, phone });
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
