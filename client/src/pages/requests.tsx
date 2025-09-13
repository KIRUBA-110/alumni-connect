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
  Users, 
  UserCheck, 
  Clock, 
  X, 
  Check,
  MessageCircle,
  UserPlus,
  UserMinus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MentorshipChat } from "@/components/mentorship-chat";

export default function Requests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("sent");

  const { data: mentorships, isLoading } = useQuery({
    queryKey: ["/api/mentorships"],
  });
  const mentorshipsArray = Array.isArray(mentorships) ? mentorships : [];

  const updateMentorshipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/mentorships/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      toast({
        title: "Success",
        description: "Mentorship status updated successfully",
      });
    },
  });

  const deleteMentorshipMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/mentorships/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      toast({
        title: "Success", 
        description: "Mentorship deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete mentorship error:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <UserCheck className="h-4 w-4" />;
      case "completed": return <UserCheck className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Filter mentorships based on user role and tab
  const sentRequests = mentorshipsArray.filter((m: any) => 
    (m.menteeId === user?.id || m.menteeId?._id === user?.id || m.menteeId?.id === user?.id)
  );

  const receivedRequests = mentorshipsArray.filter((m: any) => 
    (m.mentorId === user?.id || m.mentorId?._id === user?.id || m.mentorId?.id === user?.id) && m.status === "pending"
  );

  const activeMentorships = mentorshipsArray.filter((m: any) => 
    ((m.menteeId === user?.id || m.menteeId?._id === user?.id || m.menteeId?.id === user?.id) ||
     (m.mentorId === user?.id || m.mentorId?._id === user?.id || m.mentorId?.id === user?.id)) && m.status === "active"
  );


  const handleAcceptRequest = (id: string) => {
    updateMentorshipMutation.mutate({ id, status: "active" });
  };

  const handleDeclineRequest = (id: string) => {
    updateMentorshipMutation.mutate({ id, status: "rejected" });
  };

  const handleDeleteConnection = (id: string) => {
    deleteMentorshipMutation.mutate(id);
  };

  const renderMentorshipCard = (mentorship: any, showActions: boolean = false) => {
    const normalizedMenteeId = typeof mentorship.menteeId === 'string' ? mentorship.menteeId : mentorship.menteeId?.id || mentorship.menteeId?._id;
    const normalizedMentorId = typeof mentorship.mentorId === 'string' ? mentorship.mentorId : mentorship.mentorId?.id || mentorship.mentorId?._id;
    const isMyMentorship = normalizedMenteeId === user?.id;
    const isMentorReceivingRequest = normalizedMentorId === user?.id;
    const otherPerson = isMyMentorship ? mentorship.mentor : mentorship.mentee;
    const relationship = isMyMentorship ? "Mentor" : "Mentee";

    return (
      <Card key={mentorship.id} className="hover:shadow-md transition-shadow" data-testid={`mentorship-${mentorship.id}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {(otherPerson.fullName || otherPerson.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg" data-testid={`text-person-name-${mentorship.id}`}>
                  {otherPerson.fullName || otherPerson.username}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-person-details-${mentorship.id}`}>
                  {relationship} • {otherPerson.department}
                  {otherPerson.company && ` • ${otherPerson.company}`}
                </p>
                {mentorship.field && (
                  <Badge variant="outline" className="mt-2" data-testid={`badge-field-${mentorship.id}`}>
                    {mentorship.field}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Requested on {new Date(mentorship.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(mentorship.status)} data-testid={`badge-status-${mentorship.id}`}>
                {getStatusIcon(mentorship.status)}
                <span className="ml-1 capitalize">{mentorship.status}</span>
              </Badge>
              
              {showActions && mentorship.status === "pending" && isMentorReceivingRequest && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    disabled={updateMentorshipMutation.isPending}
                    onClick={() => handleAcceptRequest(mentorship.id)}
                    data-testid={`button-accept-${mentorship.id}`}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={updateMentorshipMutation.isPending}
                    onClick={() => handleDeclineRequest(mentorship.id)}
                    data-testid={`button-decline-${mentorship.id}`}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
              
              {mentorship.status === "active" && (
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" data-testid={`button-message-${mentorship.id}`}>
                        <MessageCircle className="mr-1 h-4 w-4" />
                        Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[85vh] w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>
                          Chat with {otherPerson.fullName || otherPerson.username}
                        </DialogTitle>
                      </DialogHeader>
                      <MentorshipChat 
                        mentorshipId={mentorship.id}
                        receiverId={otherPerson.id || otherPerson._id}
                        receiverName={otherPerson.fullName || otherPerson.username}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteConnection(mentorship.id)}
                    disabled={deleteMentorshipMutation.isPending}
                    data-testid={`button-delete-${mentorship.id}`}
                  >
                    <X className="mr-1 h-4 w-4" />
                    {deleteMentorshipMutation.isPending ? "Deleting..." : "Delete Connection"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="requests-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Connection Requests</h1>
            <p className="text-muted-foreground">Manage your mentorship connections and requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-sent-requests">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-sent-count">
                  {sentRequests.length}
                </div>
                <p className="text-sm text-muted-foreground">Sent Requests</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-received-requests">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-received-count">
                  {receivedRequests.length}
                </div>
                <p className="text-sm text-muted-foreground">Received Requests</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-active-connections">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="text-active-count">
                  {activeMentorships.length}
                </div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
              </CardContent>
            </Card>
            
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-requests">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sent" data-testid="tab-sent">Sent Requests</TabsTrigger>
              <TabsTrigger value="received" data-testid="tab-received">Received Requests</TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            </TabsList>

            {/* Sent Requests Tab */}
            <TabsContent value="sent" className="space-y-6">
              <Card data-testid="card-sent-requests-list">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Your Sent Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8" data-testid="loading-sent">
                      <p className="text-muted-foreground">Loading requests...</p>
                    </div>
                  ) : sentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests.map((mentorship: any) => renderMentorshipCard(mentorship))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-sent-requests">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
                      <p className="text-muted-foreground">
                        You haven't sent any mentorship requests yet. Visit the Feed page to connect with alumni.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Received Requests Tab */}
            <TabsContent value="received" className="space-y-6">
              <Card data-testid="card-received-requests-list">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Requests to You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8" data-testid="loading-received">
                      <p className="text-muted-foreground">Loading requests...</p>
                    </div>
                  ) : receivedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {receivedRequests.map((mentorship: any) => renderMentorshipCard(mentorship, true))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-received-requests">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                      <p className="text-muted-foreground">
                        You don't have any pending mentorship requests at the moment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Connections Tab */}
            <TabsContent value="active" className="space-y-6">
              <Card data-testid="card-active-connections-list">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Active Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8" data-testid="loading-active">
                      <p className="text-muted-foreground">Loading connections...</p>
                    </div>
                  ) : activeMentorships.length > 0 ? (
                    <div className="space-y-4">
                      {activeMentorships.map((mentorship: any) => renderMentorshipCard(mentorship))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-active-connections">
                      <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Connections</h3>
                      <p className="text-muted-foreground">
                        You don't have any active mentorship connections at the moment.
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
