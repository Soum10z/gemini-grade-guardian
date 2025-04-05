
import React from "react";
import { NavBar } from "@/components/NavBar";
import { DashboardCard } from "@/components/Dashboard/DashboardCard";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  FileText, 
  GraduationCap,
  Settings, 
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { assignments = [], userRole = 'teacher' } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add a console log to debug
  console.log("Rendering Index page", { assignments, userRole });
  
  // Calculate statistics
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const totalSubmissions = assignments.reduce((acc, assignment) => 
    acc + (assignment.submissions?.length || 0), 0);
  const gradedSubmissions = assignments.reduce((acc, assignment) => 
    acc + (assignment.submissions?.filter(s => s.status === 'graded' || s.status === 'reviewed')?.length || 0), 0);

  const recentAssignments = [...(assignments || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  const pendingSubmissions = (assignments || []).reduce((acc, assignment) => {
    const pending = (assignment.submissions || []).filter(s => s.status === 'submitted');
    return [...acc, ...pending.map(p => ({ ...p, assignment }))];
  }, [] as Array<any>).slice(0, 3);

  // Add a useful toast when the page loads to show it's working
  React.useEffect(() => {
    toast({
      title: "Welcome to Grade Guardian",
      description: "Your AI-powered teaching assistant is ready to help",
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-education-dark">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your assignments and student feedback</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-education-blue hover:bg-blue-700"
              onClick={() => navigate('/assignments/new')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Assignments" 
            icon={<BookOpen size={24} />}
            className="bg-education-light"
          >
            <div className="text-3xl font-bold">{totalAssignments}</div>
            <p className="text-sm text-gray-500">{activeAssignments} active</p>
          </DashboardCard>
          
          <DashboardCard 
            title="Total Submissions" 
            icon={<FileText size={24} />}
            className="bg-education-light"
          >
            <div className="text-3xl font-bold">{totalSubmissions}</div>
            <p className="text-sm text-gray-500">{totalSubmissions - gradedSubmissions} pending review</p>
          </DashboardCard>
          
          <DashboardCard 
            title="Grading Progress" 
            icon={<GraduationCap size={24} />}
            className="bg-education-light"
          >
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{gradedSubmissions} of {totalSubmissions}</span>
              <span className="text-sm font-medium">
                {totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0} className="h-2" />
          </DashboardCard>
          
          <DashboardCard 
            title="API Configuration" 
            icon={<Settings size={24} />}
            className="bg-education-light"
          >
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span>Gemini API Connected</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => navigate('/settings')}
            >
              Manage Settings
            </Button>
          </DashboardCard>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Recent Assignments" description="Your latest assignments">
            {recentAssignments.length > 0 ? (
              <div className="space-y-4">
                {recentAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-start border-b pb-3 last:border-0">
                    <div className="p-2 rounded-md bg-blue-100 text-education-blue mr-3">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-gray-500">{assignment.course}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/assignments')}
                >
                  View All Assignments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No assignments created yet</p>
                <Button 
                  className="mt-2 bg-education-blue hover:bg-blue-700"
                  onClick={() => navigate('/assignments/new')}
                >
                  Create Assignment
                </Button>
              </div>
            )}
          </DashboardCard>
          
          <DashboardCard title="Pending Submissions" description="Submissions awaiting review">
            {pendingSubmissions.length > 0 ? (
              <div className="space-y-4">
                {pendingSubmissions.map(item => (
                  <div key={item.id} className="flex items-start border-b pb-3 last:border-0">
                    <div className="p-2 rounded-md bg-amber-100 text-amber-600 mr-3">
                      <Clock size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.studentName}</div>
                      <div className="text-sm text-gray-500">{item.assignment.title}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/submissions/${item.id}`)}
                    >
                      Grade
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/submissions')}
                >
                  View All Submissions
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No pending submissions</p>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Index;
