
import { NavBar } from "@/components/NavBar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PlusSquare, ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const NewAssignment = () => {
  const navigate = useNavigate();
  const { createAssignment } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignmentType, setAssignmentType] = useState("essay");
  const [rubric, setRubric] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !course || !dueDate) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    try {
      // Create the new assignment
      createAssignment({
        title,
        description,
        course,
        dueDate,
        rubric,
        status: 'active',
        subject: subject || undefined
      });
      
      // Navigate to assignments list
      navigate("/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 mb-4"
            onClick={() => navigate("/assignments")}
          >
            <ArrowLeft size={18} />
            Back to Assignments
          </Button>
          
          <div className="flex items-center gap-2">
            <PlusSquare className="h-6 w-6 text-education-blue" />
            <h1 className="text-3xl font-bold text-education-dark">Create New Assignment</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title*</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="course">Course*</Label>
                  <Input
                    id="course"
                    placeholder="Enter course name"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date*</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Assignment Type*</Label>
                  <Select value={assignmentType} onValueChange={setAssignmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Assignment Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed assignment instructions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rubric">Grading Rubric</Label>
                <Textarea
                  id="rubric"
                  placeholder="Enter grading criteria (e.g., Content: 40%, Organization: 20%, etc.)"
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="min-h-32"
                />
                <p className="text-sm text-gray-500">
                  A detailed rubric helps the AI provide more accurate grading and feedback
                </p>
              </div>
              
              <div className="pt-4 flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/assignments")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-education-blue hover:bg-blue-700">
                  Create Assignment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAssignment;
