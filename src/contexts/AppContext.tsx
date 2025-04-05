import React, { createContext, useContext, useState, ReactNode } from 'react';
import { geminiService, GradingResult } from '@/services/geminiService';
import { toast } from 'sonner';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  status: 'draft' | 'active' | 'graded' | 'archived';
  rubric?: string;
  submissions: Submission[];
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  content: string;
  gradingResult?: GradingResult;
  teacherFeedback?: string;
  status: 'submitted' | 'grading' | 'graded' | 'reviewed';
}

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  userRole: 'teacher' | 'student' | null;
  login: (role: 'teacher' | 'student') => void;
  logout: () => void;
  
  // API Configuration
  configureGeminiApi: (apiKey: string) => boolean;
  isGeminiConfigured: boolean;
  
  // Assignments
  assignments: Assignment[];
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => void;
  getAssignment: (id: string) => Assignment | undefined;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  
  // Submissions
  createSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (submissionId: string) => Promise<void>;
  getSubmission: (id: string) => Submission | undefined;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data
const sampleAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Critical Analysis Essay',
    description: 'Write a 1000-word critical analysis of the assigned reading.',
    course: 'English Literature 101',
    dueDate: '2025-04-15T23:59:59Z',
    status: 'active',
    rubric: `Thesis (20%): Clear, specific, and arguable thesis statement.
Analysis (40%): Depth of analysis and critical thinking.
Evidence (20%): Effective use of textual evidence.
Organization (10%): Logical flow and structure.
Mechanics (10%): Grammar, spelling, and citation format.`,
    submissions: [],
    createdAt: '2025-04-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Data Structures Implementation',
    description: 'Implement a binary search tree with insert, delete, and traversal operations.',
    course: 'Computer Science 202',
    dueDate: '2025-04-10T23:59:59Z',
    status: 'active',
    rubric: `Implementation (50%): Correct implementation of data structure.
Time Complexity (20%): Efficiency of algorithms.
Code Quality (20%): Readability and organization.
Documentation (10%): Comments and documentation.`,
    submissions: [
      {
        id: 'sub1',
        assignmentId: '2',
        studentName: 'John Smith',
        studentId: 'student1',
        submittedAt: '2025-04-08T14:30:00Z',
        content: `class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}
class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined;
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
  // Other methods omitted for brevity
}`,
        status: 'submitted'
      }
    ],
    createdAt: '2025-03-25T09:00:00Z'
  },
  {
    id: '3',
    title: 'Research Proposal',
    description: 'Submit a 500-word research proposal on a topic of your choice within the field of psychology.',
    course: 'Introduction to Psychology',
    dueDate: '2025-04-20T23:59:59Z',
    status: 'draft',
    submissions: [],
    createdAt: '2025-04-03T11:00:00Z'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Auto-login for demo
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>('teacher'); // Default to teacher for demo
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(true); // Auto-configured for demo
  const [assignments, setAssignments] = useState<Assignment[]>(sampleAssignments);

  const login = (role: 'teacher' | 'student') => {
    setIsAuthenticated(true);
    setUserRole(role);
    toast.success(`Logged in as ${role}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    toast.success('Logged out successfully');
  };

  const configureGeminiApi = (apiKey: string) => {
    const success = geminiService.setApiKey(apiKey);
    setIsGeminiConfigured(success);
    if (success) {
      toast.success('Gemini API configured successfully');
    } else {
      toast.error('Failed to configure Gemini API');
    }
    return success;
  };

  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      submissions: []
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    toast.success('Assignment created successfully');
  };

  const getAssignment = (id: string) => {
    return assignments.find(a => a.id === id);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
    toast.success('Assignment updated successfully');
  };

  const createSubmission = (submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: Submission = {
      ...submissionData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === submissionData.assignmentId 
          ? { ...assignment, submissions: [...assignment.submissions, newSubmission] } 
          : assignment
      )
    );
    toast.success('Submission received');
  };

  const getSubmission = (id: string) => {
    for (const assignment of assignments) {
      const submission = assignment.submissions.find(s => s.id === id);
      if (submission) return submission;
    }
    return undefined;
  };

  const updateSubmission = (id: string, updates: Partial<Submission>) => {
    setAssignments(prev => 
      prev.map(assignment => ({
        ...assignment,
        submissions: assignment.submissions.map(submission => 
          submission.id === id ? { ...submission, ...updates } : submission
        )
      }))
    );
  };

  const gradeSubmission = async (submissionId: string) => {
    // Find the submission
    let targetSubmission: Submission | undefined;
    let targetAssignment: Assignment | undefined;
    
    for (const assignment of assignments) {
      const submission = assignment.submissions.find(s => s.id === submissionId);
      if (submission) {
        targetSubmission = submission;
        targetAssignment = assignment;
        break;
      }
    }
    
    if (!targetSubmission || !targetAssignment) {
      toast.error('Submission not found');
      return;
    }
    
    // Update status to grading
    updateSubmission(submissionId, { status: 'grading' });
    
    try {
      // Call Gemini API for grading
      const result = await geminiService.gradeAssignment({
        assignmentText: targetSubmission.content,
        rubric: targetAssignment.rubric,
        studentName: targetSubmission.studentName,
        courseContext: targetAssignment.course
      });
      
      // Update with grading result
      updateSubmission(submissionId, { 
        gradingResult: result,
        status: 'graded'
      });
      
      toast.success('Submission graded successfully');
    } catch (error) {
      console.error('Grading error:', error);
      updateSubmission(submissionId, { status: 'submitted' });
      toast.error('Failed to grade submission');
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    login,
    logout,
    configureGeminiApi,
    isGeminiConfigured,
    assignments,
    createAssignment,
    getAssignment,
    updateAssignment,
    createSubmission,
    gradeSubmission,
    getSubmission,
    updateSubmission
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
