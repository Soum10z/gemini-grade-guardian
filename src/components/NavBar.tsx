
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, GraduationCap, Home, LogOut, Menu, User, X
} from "lucide-react";

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-education-blue" />
            <span className="font-bold text-xl text-education-dark">Grade Guardian</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate('/assignments')}
            >
              <BookOpen size={18} />
              Assignments
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <User size={18} />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-red-500 hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden p-4 bg-white border-t">
          <div className="flex flex-col space-y-3">
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 w-full"
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
            >
              <Home size={18} />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 w-full"
              onClick={() => {
                navigate('/assignments');
                setIsOpen(false);
              }}
            >
              <BookOpen size={18} />
              Assignments
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 w-full"
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
            >
              <User size={18} />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 w-full text-red-500 hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
