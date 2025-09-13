import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { FloatingChat } from "@/components/floating-chat";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Feed from "@/pages/feed";
import Assessments from "@/pages/assessments";
import AssessmentQuiz from "@/pages/assessment-quiz";
import InterviewGuide from "@/pages/interview-guide";
import Events from "@/pages/events";
import Placements from "@/pages/placements";
import Mentoring from "@/pages/mentoring";
import HigherEducation from "@/pages/higher-education";
import Profile from "@/pages/profile";
import Requests from "@/pages/requests";
import Notifications from "@/pages/notifications";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      
      {/* Protected routes */}
      <Route path="/feed">
        <AuthGuard fallback={<Auth />}>
          <Feed />
        </AuthGuard>
      </Route>
      
      <Route path="/assessments">
        <AuthGuard fallback={<Auth />}>
          <Assessments />
        </AuthGuard>
      </Route>
      
      <Route path="/assessment/:id">
        <AuthGuard fallback={<Auth />}>
          <AssessmentQuiz />
        </AuthGuard>
      </Route>
      
      <Route path="/interview-guide">
        <AuthGuard fallback={<Auth />}>
          <InterviewGuide />
        </AuthGuard>
      </Route>
      
      <Route path="/events">
        <AuthGuard fallback={<Auth />}>
          <Events />
        </AuthGuard>
      </Route>
      
      <Route path="/placements">
        <AuthGuard fallback={<Auth />}>
          <Placements />
        </AuthGuard>
      </Route>
      
      <Route path="/mentoring">
        <AuthGuard fallback={<Auth />}>
          <Mentoring />
        </AuthGuard>
      </Route>
      
      <Route path="/higher-education">
        <AuthGuard fallback={<Auth />}>
          <HigherEducation />
        </AuthGuard>
      </Route>
      
      <Route path="/profile">
        <AuthGuard fallback={<Auth />}>
          <Profile />
        </AuthGuard>
      </Route>
      
      <Route path="/requests">
        <AuthGuard fallback={<Auth />}>
          <Requests />
        </AuthGuard>
      </Route>
      
      <Route path="/notifications">
        <AuthGuard fallback={<Auth />}>
          <Notifications />
        </AuthGuard>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Router />
            <FloatingChat />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
