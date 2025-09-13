import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, User, Camera, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import type { InsertEvent } from "@shared/schema";

export default function Events() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: new Date(),
      location: "",
      chiefGuest: "",
      images: [],
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      form.reset();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const onCreateEvent = (data: InsertEvent) => {
    createEventMutation.mutate(data);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Tech Fest": "bg-blue-100 text-blue-800",
      "Cultural": "bg-purple-100 text-purple-800",
      "Sports": "bg-green-100 text-green-800",
      "Academic": "bg-orange-100 text-orange-800",
      "Workshop": "bg-red-100 text-red-800",
      "Seminar": "bg-yellow-100 text-yellow-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getEventImage = (category: string) => {
    // Placeholder images for different event types
    const images: { [key: string]: string } = {
      "Tech Fest": "https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      "Sports": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      "Academic": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      "Workshop": "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      "Seminar": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    };
    return images[category] || images["Academic"];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="events-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Events & Activities</h1>
              <p className="text-muted-foreground">College events, announcements, and gallery</p>
            </div>
            
            {user?.role === "staff" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-event">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onCreateEvent)} className="space-y-4" data-testid="form-create-event">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        {...form.register("title")}
                        placeholder="e.g., TechnoVision 2024"
                        data-testid="input-title"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          {...form.register("category")}
                          placeholder="e.g., Tech Fest, Cultural"
                          data-testid="input-category"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          {...form.register("date", { valueAsDate: true })}
                          data-testid="input-date"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          {...form.register("location")}
                          placeholder="e.g., Main Auditorium"
                          data-testid="input-location"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="chiefGuest">Chief Guest (Optional)</Label>
                        <Input
                          id="chiefGuest"
                          {...form.register("chiefGuest")}
                          placeholder="e.g., Mr. Satya Nadella"
                          data-testid="input-chief-guest"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe the event..."
                        rows={4}
                        data-testid="input-description"
                      />
                    </div>
                    
                    <Button type="submit" disabled={createEventMutation.isPending} data-testid="button-submit-event">
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8" data-testid="loading-events">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : events && events.length > 0 ? (
              events.map((event: any) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-event-${event.id}`}>
                  <div className="relative">
                    <img 
                      src={getEventImage(event.category)} 
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(event.category)} data-testid={`badge-category-${event.id}`}>
                        {event.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800" data-testid={`badge-date-${event.id}`}>
                        {new Date(event.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <CardTitle className="text-lg mb-2" data-testid={`text-event-title-${event.id}`}>
                      {event.title}
                    </CardTitle>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-event-description-${event.id}`}>
                      {event.description}
                    </p>
                    
                    {event.chiefGuest && (
                      <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Chief Guest:</span>{" "}
                          <span className="text-accent font-medium" data-testid={`text-chief-guest-${event.id}`}>
                            {event.chiefGuest}
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span data-testid={`text-event-datetime-${event.id}`}>
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span data-testid={`text-event-location-${event.id}`}>
                          {event.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        <span>
                          Organized by {event.organizer.fullName || event.organizer.username}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedEvent(event)}
                      variant="outline" 
                      className="w-full"
                      data-testid={`button-view-gallery-${event.id}`}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full" data-testid="card-no-events">
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                  <p className="text-muted-foreground">
                    No events have been scheduled yet. Check back later for updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Events Section */}
          <Card data-testid="card-upcoming-events">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Upcoming This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events && events
                  .filter((event: any) => new Date(event.date) > new Date())
                  .slice(0, 3)
                  .map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-4 p-4 bg-secondary rounded-lg" data-testid={`upcoming-event-${event.id}`}>
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 text-center min-w-[60px]">
                        <div className="text-sm font-medium">
                          {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`text-upcoming-title-${event.id}`}>
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-upcoming-location-${event.id}`}>
                          {event.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleTimeString('en', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                    </div>
                  ))}
                
                {(!events || events.filter((event: any) => new Date(event.date) > new Date()).length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming events scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-event-details">
            <DialogHeader>
              <DialogTitle className="text-2xl" data-testid="text-modal-title">
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Event Image */}
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={getEventImage(selectedEvent.category)} 
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground" data-testid="text-modal-datetime">
                        {new Date(selectedEvent.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground" data-testid="text-modal-location">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Organized by</p>
                      <p className="text-muted-foreground" data-testid="text-modal-organizer">
                        {selectedEvent.organizer.fullName || selectedEvent.organizer.username}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.chiefGuest && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium">Chief Guest</p>
                        <p className="text-accent font-medium" data-testid="text-modal-chief-guest">
                          {selectedEvent.chiefGuest}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">About the Event</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-modal-description">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Gallery placeholder */}
              <div>
                <h3 className="font-semibold mb-3">Event Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-video bg-muted rounded-lg flex items-center justify-center" data-testid={`gallery-placeholder-${i}`}>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Gallery photos will be available after the event
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
