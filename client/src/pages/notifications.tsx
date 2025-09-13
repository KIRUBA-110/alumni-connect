import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/hooks/use-toast";
import { 
  Bell, 
  UserPlus, 
  MessageSquare, 
  Calendar,
  FileText,
  Check,
  X,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all data for notifications
  const { data: mentorships, isLoading: mentorshipsLoading } = useQuery({
    queryKey: ["/api/mentorships"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/feed"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const updateMentorshipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/mentorships/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      const action = variables.status === "active" ? "accepted" : "declined";
      toast({
        title: "Success",
        description: `Mentorship request ${action} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mentorship",
        variant: "destructive",
      });
    },
  });

  // Filter notifications based on user
  const receivedRequests = (mentorships && Array.isArray(mentorships) ? mentorships.filter((m: any) => {
    const mentorId = typeof m.mentorId === 'string' ? m.mentorId : m.mentorId?.id || m.mentorId?._id;
    return mentorId === user?.id && m.status === "pending";
  }) : []);

  const sentRequests = (mentorships && Array.isArray(mentorships) ? mentorships.filter((m: any) => {
    const menteeId = typeof m.menteeId === 'string' ? m.menteeId : m.menteeId?.id || m.menteeId?._id;
    return menteeId === user?.id && m.status === "pending";
  }) : []);

  const recentPosts = (posts && Array.isArray(posts) ? posts.slice(0, 5) : []);
  const recentEvents = (events && Array.isArray(events) ? events.slice(0, 5) : []);

  const handleAcceptRequest = (id: string) => {
    updateMentorshipMutation.mutate({ id, status: "active" });
  };

  const handleDeclineRequest = (id: string) => {
    updateMentorshipMutation.mutate({ id, status: "rejected" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request": return <UserPlus className="h-5 w-5 text-blue-600" />;
      case "post": return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "event": return <Calendar className="h-5 w-5 text-purple-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderMentorshipNotification = (mentorship: any, isReceived: boolean = false) => {
    const otherPerson = isReceived ? mentorship.mentee : mentorship.mentor;
    
    return (
      <Card key={mentorship.id} className="hover:shadow-md transition-shadow" data-testid={`notification-${mentorship.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              {getNotificationIcon("request")}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold" data-testid={`text-notification-title-${mentorship.id}`}>
                    {isReceived ? "New Mentorship Request" : "Request Status Update"}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-notification-details-${mentorship.id}`}>
                    {isReceived 
                      ? `${otherPerson.fullName || otherPerson.username} wants to connect with you`
                      : `Your request to ${otherPerson.fullName || otherPerson.username} is pending`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(mentorship.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {isReceived && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      disabled={updateMentorshipMutation.isPending}
                      onClick={() => handleAcceptRequest(mentorship.id)}
                      data-testid={`button-accept-${mentorship.id}`}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={updateMentorshipMutation.isPending}
                      onClick={() => handleDeclineRequest(mentorship.id)}
                      data-testid={`button-decline-${mentorship.id}`}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {(otherPerson.fullName || otherPerson.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{otherPerson.fullName || otherPerson.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {otherPerson.department} • {otherPerson.company || "Student"}
                  </p>
                </div>
                {mentorship.field && (
                  <Badge variant="outline" className="text-xs">
                    {mentorship.field}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPostNotification = (post: any) => {
    return (
      <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`post-notification-${post.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              {getNotificationIcon("post")}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold" data-testid={`text-post-title-${post.id}`}>
                New Post from {post.author.fullName || post.author.username}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-post-content-${post.id}`}>
                {post.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(post.createdAt).toLocaleString()}
              </p>
              
              <div className="mt-3 flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {(post.author.fullName || post.author.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.author.fullName || post.author.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.author.position && post.author.company 
                      ? `${post.author.position} at ${post.author.company}`
                      : post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1)
                    }
                  </p>
                </div>
                {post.company && (
                  <Badge variant="outline" className="text-xs">
                    {post.company}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEventNotification = (event: any) => {
    return (
      <Card key={event.id} className="hover:shadow-md transition-shadow" data-testid={`event-notification-${event.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-2 rounded-full">
              {getNotificationIcon("event")}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold" data-testid={`text-event-title-${event.id}`}>
                New Event: {event.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-event-description-${event.id}`}>
                {event.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(event.createdAt).toLocaleString()}
              </p>
              
              <div className="mt-3 flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} • {event.location}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Combine all notifications
  const allNotifications = [
    ...receivedRequests.map((req: any) => ({ ...req, type: 'request', isReceived: true })),
    ...sentRequests.map((req: any) => ({ ...req, type: 'request', isReceived: false })),
    ...recentPosts.map((post: any) => ({ ...post, type: 'post' })),
    ...recentEvents.map((event: any) => ({ ...event, type: 'event' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="notifications-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with the latest news and requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-notifications">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-total-count">
                  {allNotifications.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-pending-requests">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-count">
                  {receivedRequests.length}
                </div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-recent-posts">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="text-posts-count">
                  {recentPosts.length}
                </div>
                <p className="text-sm text-muted-foreground">Recent Posts</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-recent-events">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600" data-testid="text-events-count">
                  {recentEvents.length}
                </div>
                <p className="text-sm text-muted-foreground">Recent Events</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-notifications">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="requests" data-testid="tab-requests">Requests</TabsTrigger>
              <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
            </TabsList>

            {/* All Notifications Tab */}
            <TabsContent value="all" className="space-y-6">
              <Card data-testid="card-all-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    All Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {allNotifications.map((notification: any) => {
                        if (notification.type === 'request') {
                          return renderMentorshipNotification(notification, notification.isReceived);
                        } else if (notification.type === 'post') {
                          return renderPostNotification(notification);
                        } else if (notification.type === 'event') {
                          return renderEventNotification(notification);
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-notifications">
                      <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                      <p className="text-muted-foreground">
                        You're all caught up! Check back later for new updates.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card data-testid="card-request-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Request Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {[...receivedRequests, ...sentRequests].length > 0 ? (
                    <div className="space-y-4">
                      {receivedRequests.map((req: any) => renderMentorshipNotification(req, true))}
                      {sentRequests.map((req: any) => renderMentorshipNotification(req, false))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-request-notifications">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Request Notifications</h3>
                      <p className="text-muted-foreground">
                        No mentorship requests at the moment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <Card data-testid="card-post-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Recent Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((post: any) => renderPostNotification(post))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-post-notifications">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Recent Posts</h3>
                      <p className="text-muted-foreground">
                        No recent posts to show.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card data-testid="card-event-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Recent Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentEvents.length > 0 ? (
                    <div className="space-y-4">
                      {recentEvents.map((event: any) => renderEventNotification(event))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-event-notifications">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Recent Events</h3>
                      <p className="text-muted-foreground">
                        No recent events to show.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
