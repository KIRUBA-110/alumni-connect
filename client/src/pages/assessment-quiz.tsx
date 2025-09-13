import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import type { InsertAssessmentResult } from "@shared/schema";

export default function AssessmentQuiz() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["/api/assessments", id],
    enabled: !!id,
  });

  const submitResultMutation = useMutation({
    mutationFn: async (data: InsertAssessmentResult) => {
      const response = await apiRequest("POST", "/api/assessment-results", data);
      return response.json();
    },
    onSuccess: (result) => {
      const score = Math.round((result.score / result.totalQuestions) * 100);
      setResults({
        ...result,
        scorePercentage: score,
        questions: assessment?.questions || [],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-results"] });
      toast({
        title: "Assessment Completed",
        description: `You scored ${score}%`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit results",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, hasStarted, isSubmitted]);

  const startAssessment = () => {
    if (assessment) {
      setTimeLeft(assessment.timeLimit * 60); // Convert minutes to seconds
      setHasStarted(true);
      setAnswers(new Array(assessment.questions.length).fill(-1));
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!assessment || isSubmitted) return;

    const correctAnswers = assessment.questions.map((q: any, index: number) => {
      return answers[index] === q.correctAnswer ? 1 : 0;
    });

    const score = correctAnswers.reduce((sum: number, correct: number) => sum + correct, 0);
    const timeSpent = (assessment.timeLimit * 60) - timeLeft;

    submitResultMutation.mutate({
      assessmentId: assessment.id,
      userId: user?.id || "",
      score,
      totalQuestions: assessment.questions.length,
      timeSpent,
      answers,
    });

    setIsSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-assessment">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
              <p>Loading assessment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="assessment-not-found">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
              <h2 className="text-lg font-semibold mb-2">Assessment Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested assessment could not be found.
              </p>
              <Button onClick={() => setLocation("/assessments")} data-testid="button-back-to-assessments">
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (isSubmitted && results) {
    return (
      <div className="min-h-screen bg-background py-8" data-testid="assessment-results">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4">
                {results.scorePercentage >= 70 ? (
                  <CheckCircle className="mx-auto h-16 w-16 text-accent" />
                ) : (
                  <XCircle className="mx-auto h-16 w-16 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl mb-2">Assessment Complete!</CardTitle>
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-final-score">
                {results.scorePercentage}%
              </div>
              <p className="text-muted-foreground">
                You scored {results.score} out of {results.totalQuestions} questions correctly
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-correct-answers">
                    {results.score}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive" data-testid="text-incorrect-answers">
                    {results.totalQuestions - results.score}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-time-spent">
                    {formatTime(results.timeSpent)}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
              </div>

              {/* Question Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Review</h3>
                {results.questions.map((question: any, index: number) => {
                  const userAnswer = results.answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <Card key={index} className={`border-l-4 ${isCorrect ? "border-l-accent" : "border-l-destructive"}`} data-testid={`question-review-${index}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-accent" : ""}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        
                        <p className="mb-4" data-testid={`question-text-${index}`}>{question.question}</p>
                        
                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => {
                            const isUserAnswer = userAnswer === optionIndex;
                            const isCorrectAnswer = optionIndex === question.correctAnswer;
                            
                            let className = "p-3 rounded-lg border ";
                            if (isCorrectAnswer) {
                              className += "bg-accent/10 border-accent text-accent";
                            } else if (isUserAnswer && !isCorrect) {
                              className += "bg-destructive/10 border-destructive text-destructive";
                            } else {
                              className += "bg-muted";
                            }
                            
                            return (
                              <div key={optionIndex} className={className} data-testid={`option-${index}-${optionIndex}`}>
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  <div className="flex space-x-2">
                                    {isUserAnswer && (
                                      <Badge variant="outline" size="sm">Your Answer</Badge>
                                    )}
                                    {isCorrectAnswer && (
                                      <Badge variant="default" size="sm" className="bg-accent">Correct</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-4 p-3 bg-secondary rounded-lg">
                            <h5 className="font-medium mb-1">Explanation:</h5>
                            <p className="text-sm text-muted-foreground" data-testid={`explanation-${index}`}>
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex justify-center space-x-4 mt-8">
                <Button onClick={() => setLocation("/assessments")} data-testid="button-back-assessments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Assessments
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retake">
                  Retake Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pre-assessment view
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background py-8" data-testid="assessment-intro">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="text-assessment-title">
                {assessment.title}
              </CardTitle>
              <p className="text-muted-foreground" data-testid="text-assessment-description">
                {assessment.description}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-total-questions">
                    {assessment.questions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="text-time-limit">
                    {assessment.timeLimit}
                  </div>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2" data-testid="badge-category">
                    {assessment.category.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-secondary rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Instructions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You have {assessment.timeLimit} minutes to complete this assessment</li>
                  <li>• The timer will start automatically when you begin</li>
                  <li>• You can navigate between questions and change your answers</li>
                  <li>• The assessment will auto-submit when time expires</li>
                  <li>• Make sure you have a stable internet connection</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button onClick={startAssessment} className="px-8 py-3 text-lg" data-testid="button-start-assessment">
                  <Clock className="mr-2 h-5 w-5" />
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz view
  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8" data-testid="assessment-quiz">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold" data-testid="text-quiz-title">
                  {assessment.title}
                </h1>
                <p className="text-muted-foreground">
                  Question {currentQuestion + 1} of {assessment.questions.length}
                </p>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-destructive" : "text-primary"}`} data-testid="text-timer">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" data-testid="progress-quiz" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-6" data-testid="text-current-question">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                  data-testid={`option-${index}`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      answers[currentQuestion] === index
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                data-testid="button-prev-question"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {assessment.questions.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      index === currentQuestion
                        ? "bg-primary text-primary-foreground"
                        : answers[index] !== -1
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                    data-testid={`question-nav-${index}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentQuestion === assessment.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitResultMutation.isPending}
                  data-testid="button-submit-quiz"
                >
                  {submitResultMutation.isPending ? "Submitting..." : "Submit Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestion === assessment.questions.length - 1}
                  data-testid="button-next-question"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
