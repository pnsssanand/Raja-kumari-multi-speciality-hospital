
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, User2 } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  requestedTime: any;
  confirmedTime?: any;
  status: 'pending' | 'confirmed' | 'completed' | 'rescheduled';
  notes?: string;
  doctorName?: string;
  progressReportUrl?: string;
  prescriptionUrl?: string;
  reportUploadedAt?: any;
}

interface PatientReportsProps {
  appointments: Appointment[];
}

const PatientReports: React.FC<PatientReportsProps> = ({ appointments }) => {
  const completedAppointmentsWithReports = appointments.filter(
    appointment => 
      appointment.status === 'completed' && 
      (appointment.progressReportUrl || appointment.prescriptionUrl)
  );

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (completedAppointmentsWithReports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Doctor Prescriptions & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Reports will appear here after your doctor uploads them
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Doctor Prescriptions & Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {completedAppointmentsWithReports.map(appointment => (
            <Card key={appointment.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User2 className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Dr. {appointment.doctorName || 'Unknown'}</span>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {appointment.confirmedTime?.toDate ? 
                          format(appointment.confirmedTime.toDate(), 'PPP') : 
                          'Date not available'
                        }
                      </span>
                    </div>
                    {appointment.reportUploadedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reports uploaded: {format(appointment.reportUploadedAt.toDate(), 'PPP p')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointment.progressReportUrl && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Progress Report</p>
                          <p className="text-xs text-blue-600">Medical report document</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(appointment.progressReportUrl, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(
                            appointment.progressReportUrl!, 
                            `progress_report_${appointment.id}.pdf`
                          )}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {appointment.prescriptionUrl && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Prescription</p>
                          <p className="text-xs text-green-600">Medication prescription</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(appointment.prescriptionUrl, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(
                            appointment.prescriptionUrl!, 
                            `prescription_${appointment.id}.pdf`
                          )}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientReports;
