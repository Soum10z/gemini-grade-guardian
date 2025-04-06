
import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  FileText, 
  MessageSquare, 
  User,
  AlertCircle,
  Book,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const SubmissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSubmission, getAssignment, updateSubmission, gradeSubmission } = useApp();
  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [showRubric, setShowRubric] = useState(false);
  const [showMastery, setShowMastery] = useState(true);

  useEffect(() => {
    if (id) {
      const submissionData = getSubmission(id);
      if (submissionData) {
        setSubmission(submissionData);
        setTeacherFeedback(submissionData.teacherFeedback || "");
        const assignmentData = getAssignment(submissionData.assignmentId);
        if (assignmentData) {
          setAssignment(assignmentData);
        }
      } else {
        toast.error("Submission not found");
        navigate("/assignments");
      }
    }
    setLoading(false);
  }, [id, getSubmission, getAssignment, navigate]);

  const handleRegrade = async () => {
    if (!id) return;
    
    try {
      await gradeSubmission(id);
      // Refresh the submission data
      const updatedSubmission = getSubmission(id);
      if (updatedSubmission) {
        setSubmission(updatedSubmission);
      }
    } catch (error) {
      console.error("Error regrading submission:", error);
      toast.error("Failed to regrade submission");
    }
  };

  const handleUpdateFeedback = () => {
    if (!id) return;
    
    updateSubmission(id, { 
      status: 'reviewed',
      teacherFeedback 
    });
    
    toast.success("Feedback saved successfully");
    
    // Refresh the submission data
    const updatedSubmission = getSubmission(id);
    if (updatedSubmission) {
      setSubmission(updatedSubmission);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!submission || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-16 px-4 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-6">
            The submission you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/assignments")}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Submitted</Badge>;
      case "grading":
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Grading</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Graded</Badge>;
      case "reviewed":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Reviewed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(`/assignments/${assignment.id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignment
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-education-dark">
                  Student Submission
                </h1>
                {getSubmissionStatusBadge(submission.status)}
              </div>
              <p className="text-gray-600 mt-1">
                {assignment.title} - {assignment.course}
              </p>
            </div>

            {submission.status === "submitted" ? (
              <div className="mt-4 md:mt-0">
                <Button
                  className="bg-education-blue hover:bg-blue-700"
                  onClick={() => handleRegrade()}
                >
                  Grade Submission
                </Button>
              </div>
            ) : submission.status === "graded" && (
              <div className="mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => handleRegrade()}
                >
                  Regrade Submission
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Submission Details and Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-gray-500" />
                  {submission.studentName}'s Submission
                </CardTitle>
                <CardDescription>
                  Submitted on {formatDate(submission.submittedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md border font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[400px]">
                  {submission.content}
                </div>
              </CardContent>
            </Card>

            {submission.gradingResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    AI-Generated Feedback
                  </CardTitle>
                  <CardDescription>
                    Feedback generated by Google's Gemini API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-lg font-bold flex items-center justify-between">
                      Score: {submission.gradingResult.score}/{submission.gradingResult.maxScore}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowRubric(!showRubric)}
                      >
                        {showRubric ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Rubric
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Rubric
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {showRubric && assignment.rubric && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm whitespace-pre-line">
                        <div className="font-medium mb-2">Grading Rubric:</div>
                        {assignment.rubric}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2">Overall Feedback</h3>
                      <p>{submission.gradingResult.feedback}</p>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="strengths">
                        <AccordionTrigger className="text-green-700 font-medium">
                          Strengths
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          <ul className="list-disc pl-6 space-y-1">
                            {submission.gradingResult.strengths.map((strength: string, index: number) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="improvements">
                        <AccordionTrigger className="text-amber-700 font-medium">
                          Areas for Improvement
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          <ul className="list-disc pl-6 space-y-1">
                            {submission.gradingResult.areasForImprovement.map((area: string, index: number) => (
                              <li key={index}>{area}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {submission.gradingResult.resources && (
                        <AccordionItem value="resources">
                          <AccordionTrigger className="text-blue-700 font-medium">
                            Recommended Resources
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700">
                            <ul className="list-disc pl-6 space-y-1">
                              {submission.gradingResult.resources.map((resource: string, index: number) => (
                                <li key={index}>{resource}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            )}

            {submission.gradingResult?.subjectMastery && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="flex items-center">
                      <Book className="mr-2 h-5 w-5 text-indigo-500" />
                      Subject Mastery Analysis
                    </CardTitle>
                    <CardDescription>
                      AI assessment of student concept mastery
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowMastery(!showMastery)}
                  >
                    {showMastery ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                </CardHeader>
                {showMastery && (
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-700">Overall Mastery</h3>
                          <span className="font-medium">{submission.gradingResult.subjectMastery.overallMastery}%</span>
                        </div>
                        <Progress value={submission.gradingResult.subjectMastery.overallMastery} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          <h4 className="font-medium text-green-700 mb-2">Mastered Concepts</h4>
                          <ul className="text-sm space-y-1">
                            {submission.gradingResult.subjectMastery.conceptsMastered.map((concept: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {concept}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                          <h4 className="font-medium text-amber-700 mb-2">In Progress</h4>
                          <ul className="text-sm space-y-1">
                            {submission.gradingResult.subjectMastery.conceptsInProgress.map((concept: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <TrendingUp className="h-3 w-3 text-amber-500 mr-2 flex-shrink-0" />
                                {concept}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-md border border-red-100">
                          <h4 className="font-medium text-red-700 mb-2">Needs Improvement</h4>
                          <ul className="text-sm space-y-1">
                            {submission.gradingResult.subjectMastery.conceptsToImprove.map((concept: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <AlertCircle className="h-3 w-3 text-red-500 mr-2 flex-shrink-0" />
                                {concept}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Growth Opportunities</h4>
                        <div className="space-y-4">
                          {submission.gradingResult.subjectMastery.growthAreas.map((area: any, i: number) => (
                            <div key={i} className="border rounded-md p-3">
                              <div className="flex justify-between mb-1">
                                <h5 className="font-medium">{area.concept}</h5>
                                <span className="text-sm">{area.currentLevel}%</span>
                              </div>
                              <Progress value={area.currentLevel} className="h-1.5 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">Suggested activities:</p>
                              <ul className="text-sm list-disc pl-5 space-y-1">
                                {area.suggestedActivities.map((activity: string, j: number) => (
                                  <li key={j}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-education-blue" />
                  Teacher Feedback
                </CardTitle>
                <CardDescription>
                  Add your personal feedback to the student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your feedback for the student..."
                  className="min-h-32"
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  className="ml-auto"
                  disabled={!teacherFeedback.trim()}
                  onClick={handleUpdateFeedback}
                >
                  Save Feedback
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Student Info and Assignment Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Name
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {submission.studentName}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Student ID
                    </div>
                    <div>{submission.studentId}</div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Submission Date
                    </div>
                    <div>{formatDate(submission.submittedAt)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </div>
                    <div>{getSubmissionStatusBadge(submission.status)}</div>
                  </div>
                  
                  {submission.gradingResult && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Score
                      </div>
                      <div className="text-lg font-bold">
                        {submission.gradingResult.score}/{submission.gradingResult.maxScore}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({Math.round((submission.gradingResult.score / submission.gradingResult.maxScore) * 100)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Assignment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Title
                    </div>
                    <div className="font-medium">{assignment.title}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Course
                    </div>
                    <div>{assignment.course}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Due Date
                    </div>
                    <div>{formatDate(assignment.dueDate)}</div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Full Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
