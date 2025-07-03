import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User, Search, Star } from 'lucide-react';
import AddDoctorForm from './AddDoctorForm';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl?: string;
  availability?: string[];
  isExpert?: boolean;
  email?: string;
  createdAt?: any;
}

const DoctorsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
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

  const filteredDoctors = doctors?.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  const handleDelete = async (doctor: Doctor) => {
    try {
      await deleteDoc(doc(db, 'doctors', doctor.id));

      toast({
        title: "Doctor Deleted",
        description: `Dr. ${doctor.name} has been removed.`
      });

      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold">Doctors Management</CardTitle>
          <Button 
            className="bg-medical-600 hover:bg-medical-700 w-full sm:w-auto" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Doctors Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Doctor</TableHead>
                <TableHead className="min-w-[150px]">Specialty</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Expert</TableHead>
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-medical-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading doctors...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDoctors && filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-medical-100 flex-shrink-0">
                          {doctor.photoUrl ? (
                            <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-medical-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">Dr. {doctor.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">{doctor.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 break-all">{doctor.email || 'Not set'}</span>
                    </TableCell>
                    <TableCell>
                      {doctor.isExpert && (
                        <Badge className="bg-yellow-100 text-yellow-800 whitespace-nowrap">
                          <Star className="w-3 h-3 mr-1" />
                          Expert
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete Dr. {doctor.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(doctor)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? 'No doctors found matching your search.' : 'No doctors added yet.'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Doctor Form */}
      <AddDoctorForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </Card>
  );
};

export default DoctorsManagement;
