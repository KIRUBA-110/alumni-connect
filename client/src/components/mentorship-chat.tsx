import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

interface MentorshipChatProps {
  mentorshipId: string;
  receiverId: string;
  receiverName: string;
}

export function MentorshipChat({ mentorshipId, receiverId, receiverName }: MentorshipChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: [`/api/mentorships/${mentorshipId}/messages`],
    enabled: !!mentorshipId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/mentorships/${mentorshipId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, receiverId }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mentorships/${mentorshipId}/messages`] });
      setNewMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {receiverName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{receiverName}</h3>
            <p className="text-xs text-muted-foreground">Mentorship Chat</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message: Message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {message.sender.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-3 ${
                      isOwnMessage 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {format(new Date(message.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
