
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  BrainCircuit,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export function NavBar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b py-3 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-bold text-education-blue">
              Grade Guardian
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-education-blue transition-colors"
            >
              Dashboard
            </Link>
            {user && (
              <>
                <Link
                  to="/assignments"
                  className="text-gray-700 hover:text-education-blue transition-colors"
                >
                  Assignments
                </Link>
                {profile?.role === "teacher" && (
                  <Link
                    to="/lesson-planner"
                    className="text-gray-700 hover:text-education-blue transition-colors"
                  >
                    Lesson Planner
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-education-blue text-white">
                        {profile?.full_name ? getInitials(profile.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && (
                        <p className="font-medium">{profile.full_name}</p>
                      )}
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {profile?.role || "User"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/settings")}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" className="h-10 w-10 p-0" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-education-blue transition-colors px-2 py-1 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user && (
                <>
                  <Link
                    to="/assignments"
                    className="text-gray-700 hover:text-education-blue transition-colors px-2 py-1 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="inline mr-2 h-4 w-4" />
                    Assignments
                  </Link>
                  {profile?.role === "teacher" && (
                    <Link
                      to="/lesson-planner"
                      className="text-gray-700 hover:text-education-blue transition-colors px-2 py-1 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BrainCircuit className="inline mr-2 h-4 w-4" />
                      Lesson Planner
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="text-gray-700 hover:text-education-blue transition-colors px-2 py-1 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <SettingsIcon className="inline mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              )}
              {!user && (
                <Button
                  className="bg-education-blue hover:bg-blue-700"
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
