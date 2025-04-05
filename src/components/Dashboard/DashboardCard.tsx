
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  footer?: ReactNode;
}

export const DashboardCard = ({
  title,
  description,
  icon,
  className = "",
  children,
  onClick,
  footer,
}: DashboardCardProps) => {
  return (
    <Card 
      className={`h-full transition-all ${onClick ? 'hover:shadow-md cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="text-education-blue">{icon}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <div className="px-6 pb-4">
          {footer}
        </div>
      )}
    </Card>
  );
};
