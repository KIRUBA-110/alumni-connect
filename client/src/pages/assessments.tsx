import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { Brain, Code, Laptop, GraduationCap, Clock, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";

const categoryIcons = {
  aptitude: Brain,
  coding: Code,
  general: GraduationCap,
  cs: Laptop,
  ece: Laptop,
  mba: TrendingUp,
};

const categoryColors = {
  aptitude: "bg-blue-50 border-blue-200 text-blue-700",
  coding: "bg-green-50 border-green-200 text-green-700",
  general: "bg-purple-50 border-purple-200 text-purple-700",
  cs: "bg-orange-50 border-orange-200 text-orange-700",
  ece: "bg-red-50 border-red-200 text-red-700",
  mba: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

export default function Assessments() {
  const { user } = useAuth();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["/api/assessments"],
  });

  const { data: userResults } = useQuery({
    queryKey: ["/api/assessment-results/user", user?.id],
    enabled: !!user,
  });

  const getLastScore = (assessmentId: string) => {
    if (!userResults) return null;
    const results = userResults.filter((r: any) => r.assessmentId === assessmentId);
    if (results.length === 0) return null;
    const latest = results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return Math.round((latest.score / latest.totalQuestions) * 100);
  };

  const calculateAverageScore = () => {
    if (!userResults || userResults.length === 0) return 0;
    const scores = userResults.map((r: any) => (r.score / r.totalQuestions) * 100);
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  };

  const getCompletedAssessments = () => {
    if (!userResults) return 0;
    const uniqueAssessments = new Set(userResults.map((r: any) => r.assessmentId));
    return uniqueAssessments.size;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="assessments-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Skill Assessments</h1>
            <p className="text-muted-foreground">Test your knowledge and compare with alumni standards</p>
          </div>

          {/* Performance Analytics */}
          {userResults && userResults.length > 0 && (
            <Card data-testid="card-analytics">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Your Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary" data-testid="text-average-score">
                      {calculateAverageScore()}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent" data-testid="text-completed-assessments">
                      {getCompletedAssessments()}
                    </div>
                    <p className="text-sm text-muted-foreground">Assessments Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600" data-testid="text-total-attempts">
                      {userResults.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8" data-testid="loading-assessments">
                <p className="text-muted-foreground">Loading assessments...</p>
              </div>
            ) : assessments && assessments.length > 0 ? (
              assessments.map((assessment: any) => {
                const Icon = categoryIcons[assessment.category as keyof typeof categoryIcons] || Brain;
                const lastScore = getLastScore(assessment.id);
                
                return (
                  <Card 
                    key={assessment.id} 
                    className={`hover:shadow-md transition-shadow ${categoryColors[assessment.category as keyof typeof categoryColors]}`}
                    data-testid={`card-assessment-${assessment.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-lg" data-testid={`text-assessment-title-${assessment.id}`}>
                            {assessment.title}
                          </CardTitle>
                          <p className="text-sm opacity-80" data-testid={`text-assessment-details-${assessment.id}`}>
                            {assessment.totalQuestions} Questions • {assessment.timeLimit} mins
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm mb-4 opacity-90" data-testid={`text-assessment-description-${assessment.id}`}>
                        {assessment.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-white/50">
                            <Clock className="mr-1 h-3 w-3" />
                            {assessment.timeLimit} min
                          </Badge>
                          <Badge variant="outline" className="bg-white/50" data-testid={`badge-category-${assessment.id}`}>
                            {assessment.category.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {lastScore !== null && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Last Score</span>
                              <span className="font-medium" data-testid={`text-last-score-${assessment.id}`}>
                                {lastScore}%
                              </span>
                            </div>
                            <Progress value={lastScore} className="h-2" />
                          </div>
                        )}
                        
                        <Link href={`/assessment/${assessment.id}`}>
                          <Button className="w-full bg-white/20 hover:bg-white/30 text-inherit border-0" data-testid={`button-start-assessment-${assessment.id}`}>
                            {lastScore !== null ? "Retake Test" : "Start Test"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-full" data-testid="card-no-assessments">
                <CardContent className="text-center py-12">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new assessments to test your skills.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tips Section */}
          <Card data-testid="card-tips">
            <CardHeader>
              <CardTitle>Assessment Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Before You Start</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet environment without distractions</li>
                    <li>• Read each question carefully before answering</li>
                    <li>• Manage your time effectively across all questions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During the Test</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The timer will start automatically when you begin</li>
                    <li>• You can review and change answers before submitting</li>
                    <li>• The test will auto-submit when time expires</li>
                    <li>• Stay calm and focused throughout the assessment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
