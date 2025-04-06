import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, FileText, AlertCircle, FileUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";

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

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  content: string | null;
  status: string;
  grading_result: any;
}

interface PerformanceData {
  subject: string;
  assignments_completed: number;
  average_score: number;
  improvement: number;
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching student data:", user.id);
      fetchAssignments();
      fetchSubmissions();
      fetchPerformanceData();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      console.log("Fetching active assignments...");
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      if (error) {
        console.error("Assignment fetch error:", error);
        throw error;
      }
      
      console.log("Assignments fetched:", data?.length || 0);
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching student submissions...");
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id);

      if (error) {
        console.error("Submission fetch error:", error);
        throw error;
      }
      
      console.log("Submissions fetched:", data?.length || 0);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load your submissions');
    }
  };

  const fetchPerformanceData = async () => {
    if (!user) return;
    
    try {
      // This would typically come from an API call to get aggregated performance data
      // For now, we'll generate sample data based on the user's submissions
      const { data: submissionData, error } = await supabase
        .from('submissions')
        .select('*, assignments!inner(*)')
        .eq('student_id', user.id)
        .eq('status', 'graded');

      if (error) {
        console.error("Performance data fetch error:", error);
        throw error;
      }

      console.log("Graded submissions for performance metrics:", submissionData?.length || 0);
      
      // Process submission data to create performance metrics
      const subjectMap = new Map<string, {
        total: number;
        count: number;
        assignments: number;
      }>();

      submissionData?.forEach((submission: any) => {
        const subject = submission.assignments.subject || 'General';
        const score = submission.grading_result?.score || 0;
        
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { total: 0, count: 0, assignments: 0 });
        }
        
        const current = subjectMap.get(subject)!;
        current.total += score;
        current.count += 1;
        current.assignments += 1;
        subjectMap.set(subject, current);
      });

      const performance: PerformanceData[] = Array.from(subjectMap.entries()).map(
        ([subject, data]) => ({
          subject,
          assignments_completed: data.assignments,
          average_score: data.count > 0 ? Math.round(data.total / data.count) : 0,
          improvement: Math.random() * 20 - 5, // Random value for demo
        })
      );

      setPerformanceData(performance);
    } catch (error) {
      console.error('Error processing performance data:', error);
    }
  };

  // Filter assignments
  const upcomingAssignments = assignments.filter(
    (a) => !submissions.some((s) => s.assignment_id === a.id)
  );
  
  const submittedAssignments = assignments.filter(
    (a) => submissions.some((s) => s.assignment_id === a.id)
  );

  const isAssignmentOverdue = (dueDate: string) => {
    return isBefore(parseISO(dueDate), new Date());
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  const downloadQuestionFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignment_files')
        .download(filePath);

      if (error) throw error;

      // Create a temporary URL for the downloaded file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'question.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-education-dark">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {profile?.full_name || 'Student'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
            <TabsTrigger value="assignments" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center">
              <FileUp className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>
                  View and complete your assigned tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-education-blue"></div>
                  </div>
                ) : upcomingAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAssignments.map((assignment) => (
                      <Card key={assignment.id} className="overflow-hidden">
                        <div className="border-l-4 border-education-blue p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                {isAssignmentOverdue(assignment.due_date) && (
                                  <Badge variant="destructive" className="ml-2">Overdue</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{assignment.course}</p>
                              <p className="text-sm mt-2">{assignment.description}</p>
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                              <div className="text-sm">
                                <span className="font-medium">Due: </span>
                                {format(parseISO(assignment.due_date), 'PPP')}
                              </div>
                              <div className="flex gap-2">
                                {assignment.question_file_path && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadQuestionFile(
                                      assignment.question_file_path!, 
                                      assignment.question_file_name || 'question.pdf'
                                    )}
                                  >
                                    <FileText className="mr-1 h-4 w-4" />
                                    Download
                                  </Button>
                                )}
                                <Button 
                                  size="sm"
                                  onClick={() => navigate(`/assignments/${assignment.id}/submit`)}
                                >
                                  <FileUp className="mr-1 h-4 w-4" />
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No upcoming assignments</h3>
                    <p className="text-gray-500">
                      You're all caught up! Check back later for new assignments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>
                  Track the status of your submitted assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submittedAssignments.map((assignment) => {
                      const submission = getSubmissionForAssignment(assignment.id);
                      return (
                        <Card key={assignment.id} className="overflow-hidden">
                          <div className={`border-l-4 p-4 ${
                            submission?.status === 'graded' ? 'border-green-500' : 'border-amber-500'
                          }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                <p className="text-sm text-gray-500">{assignment.course}</p>
                                <div className="flex items-center mt-2">
                                  <Badge className={
                                    submission?.status === 'graded' ? 'bg-green-500' : 
                                    submission?.status === 'reviewed' ? 'bg-purple-500' : 'bg-amber-500'
                                  }>
                                    {submission?.status === 'graded' ? 'Graded' : 
                                     submission?.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                                  </Badge>
                                  <span className="text-xs ml-2 text-gray-500">
                                    Submitted on {submission ? format(parseISO(submission.submitted_at), 'PP') : 'Unknown'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/submissions/${submission?.id}`)}
                                >
                                  View Feedback
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No submissions yet</h3>
                    <p className="text-gray-500">
                      You haven't submitted any assignments yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>
                  Track your progress across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {performanceData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-blue-50">
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {performanceData.reduce((acc, curr) => acc + curr.assignments_completed, 0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Assignments Completed
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50">
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {Math.round(performanceData.reduce((acc, curr) => acc + curr.average_score, 0) / performanceData.length)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Average Score
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50">
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {performanceData.length}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subjects
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Performance by Subject</h3>
                      {performanceData.map((subject) => (
                        <div key={subject.subject} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{subject.subject}</div>
                            <div className="text-sm">{subject.average_score}%</div>
                          </div>
                          <Progress value={subject.average_score} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <div>{subject.assignments_completed} assignments</div>
                            <div className={subject.improvement > 0 ? 'text-green-500' : 'text-red-500'}>
                              {subject.improvement > 0 ? '+' : ''}{subject.improvement.toFixed(1)}% improvement
                            </div>
                          </div>
                          <Separator className="my-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No performance data yet</h3>
                    <p className="text-gray-500">
                      Complete and receive grades on assignments to see your performance metrics.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
