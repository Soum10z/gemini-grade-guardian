
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  BrainCircuit, 
  FileText, 
  Loader2,
  PlusCircle
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';

const LessonPlanner = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("generate");
  
  // Redirect if not logged in or not a teacher
  if (!user || profile?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Teacher Access Only</h2>
          <p className="text-gray-600 mb-6">
            This feature is only available to teachers.
          </p>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  const fetchLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setLessonPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching lesson plans:', error);
      toast.error('Failed to load lesson plans');
    }
  };
  
  const handleGenerateLessonPlan = async () => {
    if (!subject) {
      toast.error('Please select a subject');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get the current user's access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Example student performance data (in a real app, this would come from actual data)
      const studentPerformanceData = {
        averageScore: 78,
        weakAreas: ['Problem Solving', 'Critical Analysis'],
        strongAreas: ['Memorization', 'Basic Concepts']
      };
      
      // Call the Supabase Edge Function to generate the lesson plan
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          subject,
          studentPerformanceData
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Lesson plan generated successfully');
      setActiveTab('library');
      await fetchLessonPlans();
    } catch (error: any) {
      console.error('Error generating lesson plan:', error);
      toast.error(error.message || 'Failed to generate lesson plan');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fetch lesson plans when component loads
  useState(() => {
    fetchLessonPlans();
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-education-blue" />
              <h1 className="text-3xl font-bold text-education-dark">AI Lesson Planner</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Generate personalized lesson plans based on student performance
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="generate">Generate New Plan</TabsTrigger>
            <TabsTrigger value="library">Your Lesson Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate AI Lesson Plan</CardTitle>
                <CardDescription>
                  Our AI will create a personalized lesson plan optimized for your students' needs
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Area</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="computer science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BrainCircuit className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">How it works</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Our AI analyzes student performance data and creates a tailored lesson plan 
                        focused on strengthening weak areas while building on strengths.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="bg-education-blue hover:bg-blue-700"
                  onClick={handleGenerateLessonPlan}
                  disabled={isGenerating || !subject}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Generate Lesson Plan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="library">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Your Lesson Plans</CardTitle>
                    <CardDescription>
                      Browse your generated lesson plans
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {lessonPlans.length > 0 ? (
                      <div className="space-y-3">
                        {lessonPlans.map((plan) => (
                          <div 
                            key={plan.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              selectedPlan?.id === plan.id 
                                ? 'bg-blue-100 border-blue-200 border' 
                                : 'hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-education-blue" />
                              <div>
                                <h3 className="font-medium">{plan.title}</h3>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(plan.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">No plans yet</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Generate your first lesson plan to get started
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('generate')}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Plan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                {selectedPlan ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{selectedPlan.title}</CardTitle>
                      <CardDescription>
                        Created on {format(new Date(selectedPlan.created_at), 'MMMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="prose max-w-none">
                      <ReactMarkdown>{selectedPlan.content}</ReactMarkdown>
                    </CardContent>
                    
                    <CardFooter>
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-500 mb-1">Select a lesson plan</h3>
                      <p className="text-sm text-gray-400">
                        Click on a lesson plan to view its contents
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LessonPlanner;
