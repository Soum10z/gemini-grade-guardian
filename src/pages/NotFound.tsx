
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-20 w-20 text-education-blue mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2 text-education-dark">404</h1>
        <p className="text-xl text-gray-600 mb-4">Page not found</p>
        <p className="mb-6 text-gray-500">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        <Button 
          className="bg-education-blue hover:bg-blue-700"
          onClick={() => window.location.href = "/"}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
