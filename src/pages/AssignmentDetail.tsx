
import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Edit,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssignment, gradeSubmission } = useApp();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (id) {
      const assignmentData = getAssignment(id);
      if (assignmentData) {
        setAssignment(assignmentData);
      } else {
        toast.error("Assignment not found");
        navigate("/assignments");
      }
    }
    setLoading(false);
  }, [id, getAssignment, navigate]);

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

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-16 px-4 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-6">
            The assignment you're looking for doesn't exist or has been removed.
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "graded":
        return <Badge className="bg-blue-500">Graded</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return null;
    }
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

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      await gradeSubmission(submissionId);
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
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
            onClick={() => navigate("/assignments")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-education-dark">
                  {assignment.title}
                </h1>
                {getStatusBadge(assignment.status)}
              </div>
              <p className="text-gray-600 mt-1">{assignment.course}</p>
            </div>

            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => navigate(`/assignments/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Assignment
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions ({assignment.submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{assignment.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {assignment.rubric && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Grading Rubric</CardTitle>
                      <CardDescription>
                        Criteria used to evaluate submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line font-mono text-sm bg-gray-50 p-4 rounded-md border">
                        {assignment.rubric}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(assignment.dueDate)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          Created
                        </div>
                        <div>{formatDate(assignment.createdAt)}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          Status
                        </div>
                        <div>{getStatusBadge(assignment.status)}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          Submissions
                        </div>
                        <div>
                          {assignment.submissions.length} submissions received
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            {assignment.submissions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Student Submissions</CardTitle>
                  <CardDescription>
                    Review and grade student work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignment.submissions.map((submission: any) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              {submission.studentName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            {getSubmissionStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell>
                            {submission.gradingResult ? (
                              <div className="font-medium">
                                {submission.gradingResult.score}/
                                {submission.gradingResult.maxScore}
                              </div>
                            ) : (
                              <span className="text-gray-500">Not graded</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.status === "submitted" ? (
                              <Button
                                size="sm"
                                onClick={() => handleGradeSubmission(submission.id)}
                              >
                                Grade
                              </Button>
                            ) : submission.status === "grading" ? (
                              <Button size="sm" variant="outline" disabled>
                                Grading...
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/submissions/${submission.id}`)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Students haven't submitted any work for this assignment yet.
                  Check back later.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssignmentDetail;
