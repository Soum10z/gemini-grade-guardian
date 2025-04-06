
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import SubmissionDetail from "./pages/SubmissionDetail";
import Settings from "./pages/Settings";
import NewAssignment from "./pages/NewAssignment";
import Auth from "./pages/Auth";
import LessonPlanner from "./pages/LessonPlanner";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSubmission from "./pages/StudentSubmission";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

// Teacher only route component
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user || profile?.role !== 'teacher') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Student only route component
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user || profile?.role !== 'student') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { profile } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        profile ? (
          profile.role === 'student' ? 
            <Navigate to="/student-dashboard" /> : 
            <Navigate to="/assignments" />
        ) : (
          <Index />
        )
      } />
      <Route path="/auth" element={<Auth />} />
      
      {/* Teacher routes */}
      <Route path="/assignments" element={
        <TeacherRoute>
          <Assignments />
        </TeacherRoute>
      } />
      <Route path="/assignments/new" element={
        <TeacherRoute>
          <NewAssignment />
        </TeacherRoute>
      } />
      <Route path="/assignments/:id" element={
        <ProtectedRoute>
          <AssignmentDetail />
        </ProtectedRoute>
      } />
      <Route path="/submissions/:id" element={
        <ProtectedRoute>
          <SubmissionDetail />
        </ProtectedRoute>
      } />
      <Route path="/lesson-planner" element={
        <TeacherRoute>
          <LessonPlanner />
        </TeacherRoute>
      } />
      
      {/* Student routes */}
      <Route path="/student-dashboard" element={
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      } />
      <Route path="/assignments/:id/submit" element={
        <StudentRoute>
          <StudentSubmission />
        </StudentRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
