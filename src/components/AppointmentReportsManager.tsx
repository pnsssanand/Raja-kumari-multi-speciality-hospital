
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import { uploadFileToStorage, generateFilePath } from '@/utils/fileUpload';
import FileUpload from './FileUpload';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  requestedTime: any;
  confirmedTime?: any;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  progressReportUrl?: string;
  prescriptionUrl?: string;
  reportUploadedAt?: any;
}

interface AppointmentReportsManagerProps {
  appointment: Appointment;
  onAppointmentUpdate: () => void;
}

const AppointmentReportsManager: React.FC<AppointmentReportsManagerProps> = ({
  appointment,
  onAppointmentUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  const handleFileUpload = async (
    file: File, 
    type: 'progress' | 'prescription'
  ) => {
    const setUploading = type === 'progress' ? setUploadingProgress : setUploadingPrescription;
    
    try {
      setUploading(true);
      
      const filePath = generateFilePath(appointment.id, type, file.name);
      const downloadURL = await uploadFileToStorage(file, filePath);
      
      const updateData = {
        [type === 'progress' ? 'progressReportUrl' : 'prescriptionUrl']: downloadURL,
        reportUploadedAt: new Date()
      };
      
      await updateDoc(doc(db, 'appointments', appointment.id), updateData);
      
      toast({
        title: "File Uploaded Successfully",
        description: `${type === 'progress' ? 'Progress report' : 'Prescription'} has been uploaded.`
      });
      
      onAppointmentUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'completed'
      });
      
      toast({
        title: "Appointment Completed",
        description: "Appointment has been marked as completed."
      });
      
      onAppointmentUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive"
      });
    }
  };

  const hasReports = appointment.progressReportUrl || appointment.prescriptionUrl;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-green-50 hover:bg-green-100 border-green-200"
        >
          <FileText className="w-4 h-4 mr-1" />
          Reports
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Patient Reports</DialogTitle>
          <div className="text-sm text-gray-600">
            Patient: {appointment.patientName} | 
            Date: {appointment.confirmedTime?.toDate ? 
              format(appointment.confirmedTime.toDate(), 'PPP p') : 
              'Not confirmed'
            }
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Report Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Report</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="Upload Progress Report"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onFileSelect={(file) => handleFileUpload(file, 'progress')}
                uploading={uploadingProgress}
                currentFileUrl={appointment.progressReportUrl}
              />
            </CardContent>
          </Card>

          {/* Prescription Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="Upload Prescription"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onFileSelect={(file) => handleFileUpload(file, 'prescription')}
                uploading={uploadingPrescription}
                currentFileUrl={appointment.prescriptionUrl}
              />
            </CardContent>
          </Card>

          {/* Mark as Completed */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Current Status:</span>
              <Badge className={
                appointment.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            
            {appointment.status !== 'completed' && (
              <Button
                onClick={markAsCompleted}
                className="bg-green-600 hover:bg-green-700"
                disabled={uploadingProgress || uploadingPrescription}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentReportsManager;
