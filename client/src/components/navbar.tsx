import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, GraduationCap, User, LogOut, UserPlus } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Fetch pending requests for notification badge
  const { data: mentorships } = useQuery({
    queryKey: ["/api/mentorships"],
    enabled: !!user,
  });

  // Filter mentorships for different types of requests
  const receivedRequests = mentorships?.filter((m: any) => 
    (m.mentorId === user?.id || m.mentorId?._id === user?.id || m.mentorId?.id === user?.id) && m.status === "pending"
  ) || [];

  const sentRequests = mentorships?.filter((m: any) => 
    (m.menteeId === user?.id || m.menteeId?._id === user?.id || m.menteeId?.id === user?.id) && m.status === "pending"
  ) || [];

  const pendingRequests = receivedRequests;

  const navItems = [
    { href: "/feed", label: "Feed" },
    { href: "/assessments", label: "Assessments" },
    { href: "/events", label: "Events" },
    { href: "/placements", label: "Placements" },
    { href: "/interview-guide", label: "Interview Guide" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 glassmorphism" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-4" data-testid="link-home">
            <div className="text-2xl font-bold text-primary">
              <GraduationCap className="inline mr-2" />
              Alumni Connect
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`transition-colors ${
                  location === item.href 
                    ? "text-primary" 
                    : "text-foreground hover:text-primary"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                    <Bell className="h-5 w-5" />
                    {(receivedRequests.length + sentRequests.length) > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        data-testid="badge-notifications"
                      >
                        {receivedRequests.length + sentRequests.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {/* Requests Button with Badge */}
                <Link href="/requests">
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-requests">
                    <UserPlus className="h-5 w-5" />
                    {pendingRequests.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        data-testid="badge-pending-requests"
                      >
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.fullName?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium" data-testid="text-user-name">
                          {user.fullName || user.username}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground" data-testid="text-user-role">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center" data-testid="link-profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/requests" className="flex items-center" data-testid="link-requests">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Requests
                        {pendingRequests.length > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {pendingRequests.length}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button data-testid="button-login">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
