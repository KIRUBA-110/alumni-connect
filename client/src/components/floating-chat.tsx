import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MentorshipChat } from "@/components/mentorship-chat";
import { MessageCircle, X, Users } from "lucide-react";

export function FloatingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState<any>(null);

  const { data: mentorships } = useQuery({
    queryKey: ["/api/mentorships"],
  });

  const mentorshipsArray = Array.isArray(mentorships) ? mentorships : [];
  
  // Get active mentorships where user can chat
  const activeMentorships = mentorshipsArray.filter((m: any) => 
    ((m.menteeId === user?.id || m.menteeId?._id === user?.id || m.menteeId?.id === user?.id) ||
     (m.mentorId === user?.id || m.mentorId?._id === user?.id || m.mentorId?.id === user?.id)) && 
    m.status === "active"
  );

  if (!user || activeMentorships.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                Active Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {activeMentorships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active mentorships to chat with
                </p>
              ) : (
                activeMentorships.map((mentorship: any) => {
                  const isMyMentorship = mentorship.menteeId === user?.id;
                  const otherPerson = isMyMentorship ? mentorship.mentor : mentorship.mentee;
                  
                  return (
                    <Dialog key={mentorship.id}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto"
                          onClick={() => setSelectedMentorship(mentorship)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {(otherPerson.fullName || otherPerson.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm">
                                {otherPerson.fullName || otherPerson.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isMyMentorship ? "Mentor" : "Mentee"} • {otherPerson.department}
                              </p>
                              {mentorship.field && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {mentorship.field}
                                </Badge>
                              )}
                            </div>
                          </div>
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
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
