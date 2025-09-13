import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Building, User, Calendar, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInterviewGuideSchema } from "@shared/schema";
import type { InsertInterviewGuide } from "@shared/schema";

export default function InterviewGuide() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [companyFilter, setCompanyFilter] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  const { data: guides, isLoading } = useQuery({
    queryKey: ["/api/interview-guides", companyFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (companyFilter) params.append("company", companyFilter);
      const queryString = params.toString();
      return fetch(`/api/interview-guides${queryString ? `?${queryString}` : ""}`).then(res => res.json());
    },
  });

  const form = useForm<InsertInterviewGuide>({
    resolver: zodResolver(insertInterviewGuideSchema),
    defaultValues: {
      company: "",
      role: "",
      experience: "",
      questions: [],
      tips: "",
      difficulty: "medium",
    },
  });

  const createGuideMutation = useMutation({
    mutationFn: async (data: InsertInterviewGuide) => {
      // Convert questions string to array
      const questions = data.questions as any;
      const questionsArray = typeof questions === 'string' 
        ? questions.split('\n').filter(q => q.trim())
        : questions;
      
      const response = await apiRequest("POST", "/api/interview-guides", {
        ...data,
        questions: questionsArray,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interview-guides"] });
      form.reset();
      toast({
        title: "Success",
        description: "Interview guide created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create guide",
        variant: "destructive",
      });
    },
  });

  const onCreateGuide = (data: InsertInterviewGuide) => {
    createGuideMutation.mutate(data);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCompanyIcon = (company: string) => {
    // For demo purposes, using Building icon. In real app, you'd use company logos
    return <Building className="h-12 w-12" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="interview-guide-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Interview Guide</h1>
              <p className="text-muted-foreground">Real interview questions and experiences shared by alumni</p>
            </div>
            
            {(user?.role === "alumni" || user?.role === "staff") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-guide">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Share Your Interview Experience</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onCreateGuide)} className="space-y-4" data-testid="form-create-guide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          {...form.register("company")}
                          placeholder="e.g., Google, TCS, Infosys"
                          data-testid="input-company"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          {...form.register("role")}
                          placeholder="e.g., Software Engineer"
                          data-testid="input-role"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select onValueChange={(value) => form.setValue("difficulty", value as any)}>
                        <SelectTrigger data-testid="select-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Overall Experience</Label>
                      <Textarea
                        id="experience"
                        {...form.register("experience")}
                        placeholder="Describe your overall interview experience..."
                        rows={4}
                        data-testid="input-experience"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="questions">Interview Questions</Label>
                      <Textarea
                        id="questions"
                        {...form.register("questions" as any)}
                        placeholder="Enter each question on a new line..."
                        rows={6}
                        data-testid="input-questions"
                      />
                      <p className="text-sm text-muted-foreground">Enter each question on a separate line</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tips">Tips & Advice</Label>
                      <Textarea
                        id="tips"
                        {...form.register("tips")}
                        placeholder="Any tips or advice for future candidates..."
                        rows={3}
                        data-testid="input-tips"
                      />
                    </div>
                    
                    <Button type="submit" disabled={createGuideMutation.isPending} data-testid="button-submit-guide">
                      {createGuideMutation.isPending ? "Publishing..." : "Publish Guide"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search and Filter */}
          <Card data-testid="card-search">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  placeholder="Search by company (e.g., TCS, Infosys, Google)"
                  className="pl-10"
                  data-testid="input-company-search"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interview Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8" data-testid="loading-guides">
                <p className="text-muted-foreground">Loading interview guides...</p>
              </div>
            ) : guides && guides.length > 0 ? (
              guides.map((guide: any) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-guide-${guide.id}`}>
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary">
                        {getCompanyIcon(guide.company)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-guide-company-${guide.id}`}>
                          {guide.company}
                        </CardTitle>
                        <p className="text-muted-foreground" data-testid={`text-guide-role-${guide.id}`}>
                          {guide.role}
                        </p>
                      </div>
                      <Badge className={getDifficultyColor(guide.difficulty)} data-testid={`badge-difficulty-${guide.id}`}>
                        {guide.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-guide-experience-${guide.id}`}>
                      {guide.experience}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {guide.author.fullName || guide.author.username}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(guide.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedGuide(guide)}
                      className="w-full"
                      variant="outline"
                      data-testid={`button-view-details-${guide.id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full" data-testid="card-no-guides">
                <CardContent className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Interview Guides Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {companyFilter 
                      ? `No guides found for "${companyFilter}". Try searching for another company.`
                      : "Be the first to share your interview experience!"
                    }
                  </p>
                  {companyFilter && (
                    <Button variant="outline" onClick={() => setCompanyFilter("")} data-testid="button-clear-search">
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-guide-details">
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  {getCompanyIcon(selectedGuide.company)}
                </div>
                <div>
                  <DialogTitle className="text-xl" data-testid="text-modal-company">
                    {selectedGuide.company} Interview Experience
                  </DialogTitle>
                  <p className="text-muted-foreground" data-testid="text-modal-role">
                    {selectedGuide.role}
                  </p>
                </div>
                <Badge className={getDifficultyColor(selectedGuide.difficulty)} data-testid="badge-modal-difficulty">
                  {selectedGuide.difficulty}
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Author Info */}
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium" data-testid="text-modal-author">
                    {selectedGuide.author.fullName || selectedGuide.author.username}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    • {selectedGuide.author.department} • Class of {selectedGuide.author.graduationYear}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Shared on {new Date(selectedGuide.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="font-semibold mb-3">Overall Experience</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-modal-experience">
                  {selectedGuide.experience}
                </p>
              </div>

              {/* Questions */}
              <div>
                <h3 className="font-semibold mb-3">Interview Questions</h3>
                <div className="space-y-3">
                  {selectedGuide.questions.map((question: string, index: number) => (
                    <div key={index} className="bg-secondary rounded-lg p-4" data-testid={`question-${index}`}>
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-1">
                          {index + 1}
                        </div>
                        <p className="flex-1">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {selectedGuide.tips && (
                <div>
                  <h3 className="font-semibold mb-3">Tips & Advice</h3>
                  <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Star className="h-5 w-5 text-accent mt-1" />
                      <p className="text-accent-foreground leading-relaxed" data-testid="text-modal-tips">
                        {selectedGuide.tips}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
