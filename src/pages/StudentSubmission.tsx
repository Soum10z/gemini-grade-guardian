
import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Clock, FileText, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  due_date: string;
  status: string;
  subject: string;
  question_file_path: string | null;
  question_file_name: string | null;
}

const StudentSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    if (id && user) {
      fetchAssignment();
      checkExistingSubmission();
    }
  }, [id, user]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment details');
      navigate('/student-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExistingSubmission(data);
        toast('You have already submitted this assignment', {
          description: 'You can update your submission if needed.'
        });
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !assignment) return;
    if (!file && !existingSubmission) {
      toast.error('Please upload your assignment file');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let submissionContent = null;
      
      // Upload file if there is one
      if (file) {
        const fileName = `${user.id}_${assignment.id}_${Date.now()}.pdf`;
        const filePath = `submissions/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('assignment_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        submissionContent = filePath;
      }
      
      // Create or update submission
      const submission = {
        assignment_id: assignment.id,
        student_id: user.id,
        content: submissionContent || existingSubmission?.content,
        status: 'submitted',
        teacher_feedback: null,
        grading_result: null
      };
      
      let response;
      
      if (existingSubmission) {
        // Update existing submission
        response = await supabase
          .from('submissions')
          .update(submission)
          .eq('id', existingSubmission.id);
      } else {
        // Create new submission
        response = await supabase
          .from('submissions')
          .insert(submission);
      }
      
      if (response.error) throw response.error;
      
      toast.success(existingSubmission ? 'Submission updated successfully' : 'Assignment submitted successfully');
      navigate('/student-dashboard');
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast.error(`Submission failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQuestionFile = async () => {
    if (!assignment?.question_file_path) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('assignment_files')
        .download(assignment.question_file_path);

      if (error) throw error;

      // Create a temporary URL for the downloaded file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = assignment.question_file_name || 'question.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-12 px-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-education-blue"></div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Assignment not found. It may have been deleted or you don't have permission to view it.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/student-dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/student-dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h2 className="text-xl font-bold">{assignment.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Due: {format(parseISO(assignment.due_date), 'PPP')}
                  </div>
                  <div className="mt-4">
                    <p>{assignment.description}</p>
                  </div>
                </div>
                
                {assignment.question_file_path && (
                  <div className="mb-6">
                    <Button
                      variant="outline"
                      onClick={downloadQuestionFile}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Assignment File
                    </Button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">Upload Your Submission (PDF only, max 5MB)</Label>
                      <div className="mt-2">
                        <Input 
                          id="file" 
                          type="file" 
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="cursor-pointer"
                        />
                      </div>
                      {file && (
                        <p className="text-sm text-green-600 mt-1">
                          Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {existingSubmission && !file && (
                        <p className="text-sm text-amber-600 mt-1">
                          You have a previous submission. Upload a new file to replace it.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="comments">Comments (Optional)</Label>
                      <Textarea
                        id="comments"
                        placeholder="Add any comments about your submission here..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                            {existingSubmission ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course</h3>
                  <p>{assignment.course}</p>
                </div>
                
                {assignment.subject && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                    <p>{assignment.subject}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="flex items-center mt-1">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      new Date() > parseISO(assignment.due_date) ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <p>{new Date() > parseISO(assignment.due_date) ? 'Overdue' : 'Open'}</p>
                  </div>
                </div>
                
                {existingSubmission && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Submission Status</h3>
                    <p className="text-amber-600">
                      Already submitted on {format(parseISO(existingSubmission.submitted_at), 'PPP')}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-4">
                <p className="text-xs text-gray-500">
                  By submitting this assignment, you confirm that this is your own work and complies with the academic integrity policy.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmission;
