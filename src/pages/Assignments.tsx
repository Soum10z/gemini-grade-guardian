
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Search,
  SlidersHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Assignments = () => {
  const { assignments } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === null || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'graded':
        return <Badge className="bg-blue-500">Graded</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-education-dark">Assignments</h1>
            <p className="text-gray-600 mt-1">Manage and track all your assignments</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-education-blue hover:bg-blue-700"
              onClick={() => navigate('/assignments/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Status:</span>
              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === 'active' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'archived' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter('archived')}
                >
                  Archived
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAssignments.map(assignment => (
              <Card 
                key={assignment.id} 
                className="p-6 hover:border-education-blue transition-colors cursor-pointer"
                onClick={() => navigate(`/assignments/${assignment.id}`)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="p-3 rounded-md bg-blue-100 text-education-blue">
                    <FileText size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h3 className="font-bold text-lg">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-gray-500 mt-1">{assignment.course}</p>
                    <p className="text-sm mt-2 line-clamp-2">{assignment.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
                    <div className="text-sm text-gray-500">
                      Due: {formatDate(assignment.dueDate)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>{assignment.submissions.length} submissions</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium mb-2">No assignments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter 
                ? "Try adjusting your search or filters"
                : "Create your first assignment to get started"}
            </p>
            {!searchTerm && !statusFilter && (
              <Button 
                className="bg-education-blue hover:bg-blue-700"
                onClick={() => navigate('/assignments/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
