import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, Filter, Plus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import type { InsertPost } from "@shared/schema";

export default function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [companyFilter, setCompanyFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/feed", companyFilter, fieldFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (companyFilter) params.append("company", companyFilter);
      if (fieldFilter) params.append("field", fieldFilter);
      const queryString = params.toString();
      return fetch(`/api/feed${queryString ? `?${queryString}` : ""}`).then(res => res.json());
    },
  });

  const { data: alumni } = useQuery({
    queryKey: ["/api/alumni", companyFilter, fieldFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (companyFilter) params.append("company", companyFilter);
      if (fieldFilter) params.append("field", fieldFilter);
      const queryString = params.toString();
      return fetch(`/api/alumni${queryString ? `?${queryString}` : ""}`).then(res => res.json());
    },
  });

  const postForm = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      company: "",
      field: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      const response = await apiRequest("POST", "/api/feed", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      postForm.reset();
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const onCreatePost = (data: InsertPost) => {
    createPostMutation.mutate(data);
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setFieldFilter("");
  };

  const handleConnect = async (alumnusId: string, alumnusName: string) => {
    try {
      // Create a mentorship request
      const response = await apiRequest("POST", "/api/mentorships", {
        mentorId: alumnusId,
        menteeId: user?.id,
        status: "pending",
        field: "General"
      });
      
      if (response.ok) {
        toast({
          title: "Connection Request Sent",
          description: `Your connection request has been sent to ${alumnusName}`,
        });
      } else {
        throw new Error("Failed to send connection request");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="feed-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Alumni Feed</h1>
              <p className="text-muted-foreground">Connect with alumni and discover opportunities</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              
              {(user?.role === "alumni" || user?.role === "staff") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-post">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={postForm.handleSubmit(onCreatePost)} className="space-y-4" data-testid="form-create-post">
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          {...postForm.register("content")}
                          placeholder="Share your experience, advice, or opportunities..."
                          rows={4}
                          data-testid="input-post-content"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company (Optional)</Label>
                          <Input
                            id="company"
                            {...postForm.register("company")}
                            placeholder="e.g., Google, TCS"
                            data-testid="input-post-company"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="field">Field (Optional)</Label>
                          <Input
                            id="field"
                            {...postForm.register("field")}
                            placeholder="e.g., Software Development"
                            data-testid="input-post-field"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-submit-post">
                        {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card data-testid="card-filters">
              <CardHeader>
                <CardTitle className="text-lg">Filter Alumni Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-filter">Company</Label>
                    <Input
                      id="company-filter"
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      placeholder="Search by company (e.g., TCS, Infosys)"
                      data-testid="input-company-filter"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field-filter">Field</Label>
                    <Select value={fieldFilter} onValueChange={setFieldFilter}>
                      <SelectTrigger data-testid="select-field-filter">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Fields</SelectItem>
                        <SelectItem value="Software Development">Software Development</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Product Management">Product Management</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alumni Suggestions */}
          {alumni && alumni.length > 0 && (
            <Card data-testid="card-alumni-suggestions">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Alumni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alumni.slice(0, 4).map((alumnus: any) => (
                    <div key={alumnus.id} className="flex items-center space-x-4 p-4 bg-secondary rounded-lg" data-testid={`card-alumni-${alumnus.id}`}>
                      <Avatar>
                        <AvatarFallback>
                          {alumnus.fullName?.charAt(0)?.toUpperCase() || alumnus.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`text-alumni-name-${alumnus.id}`}>
                          {alumnus.fullName || alumnus.username}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-alumni-position-${alumnus.id}`}>
                          {alumnus.position} at {alumnus.company}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-alumni-department-${alumnus.id}`}>
                          {alumnus.department} • Class of {alumnus.graduationYear}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleConnect(alumnus.id, alumnus.fullName || alumnus.username)}
                        data-testid={`button-connect-${alumnus.id}`}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-posts">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`card-post-${post.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {post.author.fullName?.charAt(0)?.toUpperCase() || post.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg" data-testid={`text-post-author-${post.id}`}>
                              {post.author.fullName || post.author.username}
                            </h3>
                            <p className="text-muted-foreground" data-testid={`text-post-author-position-${post.id}`}>
                              {post.author.position && post.author.company 
                                ? `${post.author.position} at ${post.author.company}`
                                : post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1)
                              }
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-post-author-details-${post.id}`}>
                              {post.author.department} • Class of {post.author.graduationYear}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {post.company && (
                              <Badge variant="secondary" data-testid={`badge-post-company-${post.id}`}>
                                {post.company}
                              </Badge>
                            )}
                            {post.field && (
                              <Badge variant="outline" data-testid={`badge-post-field-${post.id}`}>
                                {post.field}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-foreground mb-4" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors" data-testid={`button-like-${post.id}`}>
                            <Heart className="h-4 w-4" />
                            <span>{post.likes} likes</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors" data-testid={`button-comment-${post.id}`}>
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments} comments</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors" data-testid={`button-share-${post.id}`}>
                            <Share className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card data-testid="card-no-posts">
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {companyFilter || fieldFilter 
                      ? "Try adjusting your filters to see more posts." 
                      : "Be the first to share something with the community!"
                    }
                  </p>
                  {(companyFilter || fieldFilter) && (
                    <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
