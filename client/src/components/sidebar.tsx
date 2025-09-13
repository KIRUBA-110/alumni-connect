import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Podcast, 
  Users, 
  Brain, 
  HelpCircle,
  GraduationCap,
  Calendar,
  TrendingUp
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: userResults } = useQuery({
    queryKey: ["/api/assessment-results/user", user?.id],
    enabled: !!user,
  });

  const quickActions = [
    { href: "/feed", icon: Podcast, label: "Alumni Feed" },
    { href: "/mentoring", icon: Users, label: "Find Mentor" },
    { href: "/assessments", icon: Brain, label: "Take Quiz" },
    { href: "/interview-guide", icon: HelpCircle, label: "Interview Guide" },
    { href: "/higher-education", icon: GraduationCap, label: "Higher Education" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/placements", icon: TrendingUp, label: "Placements" },
  ];

  const profileCompletion = user ? calculateProfileCompletion(user) : 0;
  const assessmentsCompleted = userResults?.length || 0;

  return (
    <aside className="lg:col-span-1" data-testid="sidebar">
      <Card className="p-6 sticky top-24">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <nav className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = location === action.href;
              
              return (
                <Link 
                  key={action.href} 
                  href={action.href}
                  className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${
                    isActive 
                      ? "text-primary bg-secondary" 
                      : "text-muted-foreground hover:text-primary hover:bg-secondary"
                  }`}
                  data-testid={`link-${action.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {user && (
          <div className="border-t border-border pt-6">
            <h4 className="font-medium mb-4">Your Progress</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile Completion</span>
                  <span data-testid="text-profile-completion">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assessments Completed</span>
                  <span data-testid="text-assessments-completed">{assessmentsCompleted}/10</span>
                </div>
                <Progress value={(assessmentsCompleted / 10) * 100} className="h-2" />
              </div>
            </div>
          </div>
        )}
      </Card>
    </aside>
  );
}

function calculateProfileCompletion(user: any): number {
  const fields = [
    'fullName', 'email', 'department', 'graduationYear', 
    'company', 'position', 'location', 'bio'
  ];
  
  const completedFields = fields.filter(field => 
    user[field] && user[field].toString().trim() !== ''
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
}
