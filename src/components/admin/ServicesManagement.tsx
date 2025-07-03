
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Briefcase } from 'lucide-react';
import ServiceForm from './ServiceForm';

interface Service {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;
  createdAt?: any;
}

interface ServiceFormData {
  title: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
}

const ServicesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    iconUrl: '',
    imageUrl: ''
  });

  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
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

  const filteredServices = services?.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      iconUrl: '',
      imageUrl: ''
    });
  }, []);

  const handleFormDataChange = useCallback((data: ServiceFormData) => {
    setFormData(data);
  }, []);

  const handleAdd = async () => {
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the service title and description.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, 'services'), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        iconUrl: formData.iconUrl?.trim() || '',
        imageUrl: formData.imageUrl?.trim() || '',
        createdAt: Timestamp.now()
      });

      toast({
        title: "Service Added",
        description: `${formData.title} has been added successfully.`
      });

      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      iconUrl: service.iconUrl || '',
      imageUrl: service.imageUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingService || !formData.title?.trim() || !formData.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the service title and description.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'services', editingService.id), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        iconUrl: formData.iconUrl?.trim() || '',
        imageUrl: formData.imageUrl?.trim() || '',
        updatedAt: Timestamp.now()
      });

      toast({
        title: "Service Updated",
        description: `${formData.title} has been updated successfully.`
      });

      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsEditDialogOpen(false);
      setEditingService(null);
      resetForm();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (service: Service) => {
    try {
      await deleteDoc(doc(db, 'services', service.id));

      toast({
        title: "Service Deleted",
        description: `${service.title} has been removed.`
      });

      queryClient.invalidateQueries({ queryKey: ['services'] });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">Services Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-medical-600 hover:bg-medical-700 w-full sm:w-auto" 
                onClick={resetForm}
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add New Service</DialogTitle>
              </DialogHeader>
              <ServiceForm
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleAdd}
                submitText="Add Service"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services Table - Responsive */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Service</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[300px]">Description</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-600"></div>
                        <span>Loading services...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredServices && filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <TableRow key={service.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-medical-100 flex items-center justify-center flex-shrink-0">
                            {service.imageUrl ? (
                              <img 
                                src={service.imageUrl} 
                                alt={service.title} 
                                className="w-full h-full object-cover" 
                              />
                            ) : service.iconUrl ? (
                              <img 
                                src={service.iconUrl} 
                                alt={service.title} 
                                className="w-6 h-6" 
                              />
                            ) : (
                              <Briefcase className="w-6 h-6 text-medical-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{service.title}</p>
                            <p className="text-sm text-gray-600 md:hidden line-clamp-2 mt-1">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{service.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(service)} 
                                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                                >
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
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="text-center">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No services found</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400 mt-1">
                            Try adjusting your search terms
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Edit Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleUpdate}
              submitText="Update Service"
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ServicesManagement;
