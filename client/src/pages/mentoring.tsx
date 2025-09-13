import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Users, MessageCircle, UserCheck, Clock, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMentorshipSchema } from "@shared/schema";
import type { InsertMentorship } from "@shared/schema";

export default function Mentoring() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchField, setSearchField] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);

  const { data: mentorships, isLoading: mentorshipsLoading } = useQuery({
    queryKey: ["/api/mentorships"],
  });
  const mentorshipsList = Array.isArray(mentorships) ? mentorships : [];

  const { data: alumni, isLoading: alumniLoading } = useQuery({
    queryKey: ["/api/alumni", "", searchField],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchField) params.append("field", searchField);
      const queryString = params.toString();
      return fetch(`/api/alumni${queryString ? `?${queryString}` : ""}`).then(res => res.json());
    },
  });

  // Get students from same college (for mentors)
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/users", "students", user?.college],
    queryFn: () => {
      if (!user?.college) return [];
      const params = new URLSearchParams();
      params.append("role", "student");
      params.append("college", user.college);
      return fetch(`/api/users?${params.toString()}`).then(res => res.json());
    },
    enabled: user?.role === "alumni" && !!user?.college,
  });

  // Get mentors from same college (for students) 
  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ["/api/users", "mentors", user?.college],
    queryFn: () => {
      if (!user?.college) return [];
      const params = new URLSearchParams();
      params.append("role", "alumni");
      params.append("college", user.college);
      return fetch(`/api/users?${params.toString()}`).then(res => res.json());
    },
    enabled: user?.role === "student" && !!user?.college,
  });

  const form = useForm<InsertMentorship>({
    resolver: zodResolver(insertMentorshipSchema),
    defaultValues: {
      mentorId: "",
      menteeId: "",
      field: "",
      status: "pending",
    },
  });

  const requestMentorshipMutation = useMutation({
    mutationFn: async (data: InsertMentorship) => {
      const response = await apiRequest("POST", "/api/mentorships", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      toast({
        title: "Success",
        description: "Mentorship request sent successfully",
      });
      setSelectedMentor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send mentorship request",
        variant: "destructive",
      });
    },
  });

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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mentorship",
        variant: "destructive",
      });
    },
  });

  const onRequestMentorship = (data: InsertMentorship) => {
    requestMentorshipMutation.mutate({
      ...data,
      menteeId: user?.id || "",
      mentorId: selectedMentor.id,
    });
  };

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

  const myMentorships = mentorshipsList.filter((m: any) => {
    const menteeId = typeof m.menteeId === 'string' ? m.menteeId : m.menteeId?.id || m.menteeId?._id;
    const mentorId = typeof m.mentorId === 'string' ? m.mentorId : m.mentorId?.id || m.mentorId?._id;
    return menteeId === user?.id || mentorId === user?.id;
  });

  const pendingRequests = mentorshipsList.filter((m: any) => {
    const mentorId = typeof m.mentorId === 'string' ? m.mentorId : m.mentorId?.id || m.mentorId?._id;
    return mentorId === user?.id && m.status === "pending";
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="mentoring-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Mentoring</h1>
            <p className="text-muted-foreground">Connect with alumni mentors and get career guidance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-active-mentorships">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="text-active-mentorships">
                  {myMentorships.filter((m: any) => m.status === "active").length}
                </div>
                <p className="text-sm text-muted-foreground">Active Mentorships</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-pending-requests">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-requests">
                  {user?.role === "alumni" ? pendingRequests.length : myMentorships.filter((m: any) => m.status === "pending").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.role === "alumni" ? "Pending Requests" : "Pending Applications"}
                </p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-completed-mentorships">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-completed-mentorships">
                  {myMentorships.filter((m: any) => m.status === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground">Completed Mentorships</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests (for alumni) */}
          {user?.role === "alumni" && pendingRequests.length > 0 && (
            <Card data-testid="card-mentorship-requests">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Mentorship Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((mentorship: any) => (
                    <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`request-${mentorship.id}`}>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {(mentorship.mentee.fullName || mentorship.mentee.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium" data-testid={`text-mentee-name-${mentorship.id}`}>
                            {mentorship.mentee.fullName || mentorship.mentee.username}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-mentee-details-${mentorship.id}`}>
                            {mentorship.mentee.department} • Class of {mentorship.mentee.graduationYear}
                          </p>
                          {mentorship.field && (
                            <Badge variant="outline" className="mt-1" data-testid={`badge-field-${mentorship.id}`}>
                              {mentorship.field}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          disabled={updateMentorshipMutation.isPending}
                          onClick={() => updateMentorshipMutation.mutate({ id: mentorship.id, status: "active" })}
                          data-testid={`button-accept-${mentorship.id}`}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={updateMentorshipMutation.isPending}
                          onClick={() => updateMentorshipMutation.mutate({ id: mentorship.id, status: "rejected" })}
                          data-testid={`button-decline-${mentorship.id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Mentorships */}
          {myMentorships.length > 0 && (
            <Card data-testid="card-my-mentorships">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  My Mentorships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myMentorships.map((mentorship: any) => {
                    const isMyMentorship = mentorship.menteeId === user?.id;
                    const otherPerson = isMyMentorship ? mentorship.mentor : mentorship.mentee;
                    
                    return (
                      <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`mentorship-${mentorship.id}`}>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {(otherPerson.fullName || otherPerson.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium" data-testid={`text-other-person-name-${mentorship.id}`}>
                              {otherPerson.fullName || otherPerson.username}
                            </h4>
                            <p className="text-sm text-muted-foreground" data-testid={`text-other-person-details-${mentorship.id}`}>
                              {isMyMentorship ? "Your Mentor" : "Your Mentee"} • {otherPerson.department}
                              {otherPerson.company && ` • ${otherPerson.company}`}
                            </p>
                            {mentorship.field && (
                              <Badge variant="outline" className="mt-1" data-testid={`badge-mentorship-field-${mentorship.id}`}>
                                {mentorship.field}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(mentorship.status)} data-testid={`badge-status-${mentorship.id}`}>
                            {getStatusIcon(mentorship.status)}
                            <span className="ml-1 capitalize">{mentorship.status}</span>
                          </Badge>
                          
                          {mentorship.status === "active" && (
                            <Button size="sm" variant="outline" data-testid={`button-message-${mentorship.id}`}>
                              <MessageCircle className="mr-1 h-4 w-4" />
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Find Mentors (for students) */}
          {user?.role === "student" && (
            <Card data-testid="card-find-mentors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Find Mentors from {user?.college}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        placeholder="Search by field (e.g., Software Development, Data Science)"
                        data-testid="input-search-field"
                      />
                    </div>
                    <Button variant="outline" onClick={() => setSearchField("")} data-testid="button-clear-search">
                      <Filter className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentorsLoading ? (
                    <div className="col-span-full text-center py-8" data-testid="loading-mentors">
                      <p className="text-muted-foreground">Loading mentors...</p>
                    </div>
                  ) : mentors && mentors.length > 0 ? (
                    mentors
                      .filter((mentor: any) => 
                        // Don't show current user in suggestions
                        mentor.id !== user?.id &&
                        // Don't show mentors who already have active/pending mentorships with current user
                        !mentorshipsList.some((m: any) => {
                          const mentorId = typeof m.mentorId === 'string' ? m.mentorId : m.mentorId?.id || m.mentorId?._id;
                          const menteeId = typeof m.menteeId === 'string' ? m.menteeId : m.menteeId?.id || m.menteeId?._id;
                          return mentorId === mentor.id && menteeId === user?.id && (m.status === "active" || m.status === "pending");
                        }) &&
                        // Filter by search field if provided
                        (!searchField || (mentor.company && mentor.company.toLowerCase().includes(searchField.toLowerCase())) ||
                         (mentor.position && mentor.position.toLowerCase().includes(searchField.toLowerCase())) ||
                         (mentor.department && mentor.department.toLowerCase().includes(searchField.toLowerCase())))
                      )
                      .map((mentor: any) => (
                        <Card key={mentor.id} className="hover:shadow-md transition-shadow" data-testid={`card-mentor-${mentor.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {(mentor.fullName || mentor.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg" data-testid={`text-mentor-name-${mentor.id}`}>
                                  {mentor.fullName || mentor.username}
                                </h3>
                                <p className="text-muted-foreground" data-testid={`text-mentor-position-${mentor.id}`}>
                                  {mentor.position} {mentor.company && `at ${mentor.company}`}
                                </p>
                                <p className="text-sm text-muted-foreground" data-testid={`text-mentor-education-${mentor.id}`}>
                                  {mentor.department} • Class of {mentor.graduationYear}
                                </p>
                                
                                {mentor.location && (
                                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-mentor-location-${mentor.id}`}>
                                    📍 {mentor.location}
                                  </p>
                                )}
                                
                                {mentor.bio && (
                                  <p className="text-sm mt-3 line-clamp-3" data-testid={`text-mentor-bio-${mentor.id}`}>
                                    {mentor.bio}
                                  </p>
                                )}
                                
                                <Button 
                                  className="mt-4"
                                  onClick={() => setSelectedMentor(mentor)}
                                  data-testid={`button-request-mentorship-${mentor.id}`}
                                >
                                  Request Mentorship
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-8" data-testid="no-mentors">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
                      <p className="text-muted-foreground">
                        {searchField 
                          ? `No mentors found for "${searchField}" at ${user?.college}.`
                          : `No alumni mentors are currently available from ${user?.college}.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Find Students (for alumni/mentors) */}
          {user?.role === "alumni" && (
            <Card data-testid="card-find-students">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Students from {user?.college}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentsLoading ? (
                    <div className="col-span-full text-center py-8" data-testid="loading-students">
                      <p className="text-muted-foreground">Loading students...</p>
                    </div>
                  ) : students && students.length > 0 ? (
                    students
                      .filter((student: any) => 
                        // Don't show current user
                        student.id !== user?.id &&
                        // Don't show students who already have active/pending mentorships with current user
                        !mentorshipsList.some((m: any) => {
                          const mentorId = typeof m.mentorId === 'string' ? m.mentorId : m.mentorId?.id || m.mentorId?._id;
                          const menteeId = typeof m.menteeId === 'string' ? m.menteeId : m.menteeId?.id || m.menteeId?._id;
                          return mentorId === user?.id && menteeId === student.id && (m.status === "active" || m.status === "pending");
                        })
                      )
                      .map((student: any) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow" data-testid={`card-student-${student.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {(student.fullName || student.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg" data-testid={`text-student-name-${student.id}`}>
                                  {student.fullName || student.username}
                                </h3>
                                <p className="text-muted-foreground" data-testid={`text-student-education-${student.id}`}>
                                  {student.department} • Class of {student.graduationYear}
                                </p>
                                
                                {student.location && (
                                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-student-location-${student.id}`}>
                                    📍 {student.location}
                                  </p>
                                )}
                                
                                {student.bio && (
                                  <p className="text-sm mt-3 line-clamp-3" data-testid={`text-student-bio-${student.id}`}>
                                    {student.bio}
                                  </p>
                                )}
                                
                                <div className="mt-4 flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">Available for mentorship opportunities</p>
                                  <Button
                                    size="sm"
                                    disabled={requestMentorshipMutation.isPending}
                                    onClick={() => requestMentorshipMutation.mutate({
                                      mentorId: user?.id || "",
                                      menteeId: student.id,
                                      field: "",
                                      status: "pending",
                                    })}
                                    data-testid={`button-invite-mentor-${student.id}`}
                                  >
                                    {requestMentorshipMutation.isPending ? "Sending..." : "Invite to Mentor"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-8" data-testid="no-students">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                      <p className="text-muted-foreground">
                        No students are currently available from {user?.college}.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
          <DialogContent data-testid="modal-request-mentorship">
            <DialogHeader>
              <DialogTitle>Request Mentorship</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-secondary rounded-lg">
                <Avatar>
                  <AvatarFallback>
                    {(selectedMentor.fullName || selectedMentor.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold" data-testid="text-modal-mentor-name">
                    {selectedMentor.fullName || selectedMentor.username}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-modal-mentor-position">
                    {selectedMentor.position} at {selectedMentor.company}
                  </p>
                </div>
              </div>
              
              <form onSubmit={form.handleSubmit(onRequestMentorship)} className="space-y-4" data-testid="form-request-mentorship">
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Interest</Label>
                  <Input
                    id="field"
                    {...form.register("field")}
                    placeholder="e.g., Software Development, Data Science"
                    data-testid="input-mentorship-field"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedMentor(null)}
                    data-testid="button-cancel-request"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={requestMentorshipMutation.isPending}
                    data-testid="button-send-request"
                  >
                    {requestMentorshipMutation.isPending ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
