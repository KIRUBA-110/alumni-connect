import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { 
  GraduationCap, 
  University, 
  Globe, 
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

export default function HigherEducation() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("gate");

  const gateResources = [
    {
      id: 1,
      title: "GATE Computer Science Syllabus 2024",
      description: "Complete syllabus with topic-wise breakdown and weightage",
      type: "document",
      category: "Computer Science",
      downloads: 1250,
    },
    {
      id: 2,
      title: "GATE Previous Year Papers (2015-2023)",
      description: "Comprehensive collection of previous year question papers with solutions",
      type: "papers",
      category: "All Subjects",
      downloads: 2100,
    },
    {
      id: 3,
      title: "Data Structures & Algorithms Mock Tests",
      description: "20 practice tests covering all major DSA topics",
      type: "test",
      category: "Computer Science",
      downloads: 890,
    },
    {
      id: 4,
      title: "Digital Logic Design Notes",
      description: "Comprehensive notes with examples and practice problems",
      type: "notes",
      category: "Electronics",
      downloads: 670,
    },
  ];

  const universityPrograms = [
    {
      id: 1,
      name: "Indian Institute of Technology (IITs)",
      programs: ["M.Tech", "PhD"],
      admissionProcess: "GATE Score + Interview",
      deadline: "March 2024",
      website: "#",
      logo: "🏛️",
    },
    {
      id: 2,
      name: "National Institute of Technology (NITs)",
      programs: ["M.Tech", "PhD"],
      admissionProcess: "GATE Score + Counselling",
      deadline: "April 2024",
      website: "#",
      logo: "🏢",
    },
    {
      id: 3,
      name: "Indian Institute of Science (IISc)",
      programs: ["M.Tech", "PhD"],
      admissionProcess: "GATE Score + Written Test + Interview",
      deadline: "February 2024",
      website: "#",
      logo: "🔬",
    },
  ];

  const studyAbroadOptions = [
    {
      id: 1,
      country: "United States",
      universities: ["MIT", "Stanford", "CMU", "UC Berkeley"],
      exams: ["GRE", "TOEFL/IELTS"],
      avgCost: "$50,000 - $70,000/year",
      scholarships: "Merit-based, Need-based",
      flag: "🇺🇸",
    },
    {
      id: 2,
      country: "Germany",
      universities: ["TUM", "RWTH Aachen", "KIT", "TU Berlin"],
      exams: ["GRE (optional)", "IELTS/TestDaF"],
      avgCost: "€500 - €3,000/year",
      scholarships: "DAAD, Erasmus+",
      flag: "🇩🇪",
    },
    {
      id: 3,
      country: "Canada",
      universities: ["University of Toronto", "UBC", "McGill", "Waterloo"],
      exams: ["GRE", "IELTS/TOEFL"],
      avgCost: "CAD 25,000 - 40,000/year",
      scholarships: "Provincial, University-specific",
      flag: "🇨🇦",
    },
  ];

  const examPreparation = [
    {
      exam: "GRE",
      sections: ["Verbal Reasoning", "Quantitative Reasoning", "Analytical Writing"],
      duration: "3 hours 45 minutes",
      fee: "$220",
      validity: "5 years",
      tips: "Focus on vocabulary building and practice time management",
    },
    {
      exam: "TOEFL",
      sections: ["Reading", "Listening", "Speaking", "Writing"],
      duration: "3 hours",
      fee: "$195",
      validity: "2 years",
      tips: "Practice speaking and listening daily, familiarize with academic English",
    },
    {
      exam: "IELTS",
      sections: ["Listening", "Reading", "Writing", "Speaking"],
      duration: "2 hours 45 minutes",
      fee: "$245",
      validity: "2 years",
      tips: "Focus on British English, practice writing essays within time limits",
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-5 w-5" />;
      case "papers": return <BookOpen className="h-5 w-5" />;
      case "test": return <Target className="h-5 w-5" />;
      case "notes": return <BookOpen className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="higher-education-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Higher Education & GATE Prep
            </h1>
            <p className="text-muted-foreground">
              Resources for pursuing higher studies and competitive exams
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200" data-testid="card-gate-prep">
              <CardContent className="p-6 text-center">
                <div className="bg-indigo-600 text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">GATE Preparation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive study materials, previous year papers, and mock tests
                </p>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setSelectedCategory("gate")}
                  data-testid="button-gate-prep"
                >
                  Access Resources
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200" data-testid="card-university-admissions">
              <CardContent className="p-6 text-center">
                <div className="bg-teal-600 text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <University className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">University Admissions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Guidance for IITs, NITs, and top universities abroad
                </p>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => setSelectedCategory("universities")}
                  data-testid="button-university-admissions"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200" data-testid="card-study-abroad">
              <CardContent className="p-6 text-center">
                <div className="bg-rose-600 text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Study Abroad</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  GRE, TOEFL preparation and international university applications
                </p>
                <Button 
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={() => setSelectedCategory("abroad")}
                  data-testid="button-study-abroad"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} data-testid="tabs-main-content">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gate" data-testid="tab-gate">GATE Preparation</TabsTrigger>
              <TabsTrigger value="universities" data-testid="tab-universities">Universities</TabsTrigger>
              <TabsTrigger value="abroad" data-testid="tab-abroad">Study Abroad</TabsTrigger>
            </TabsList>

            {/* GATE Preparation Tab */}
            <TabsContent value="gate" className="space-y-6">
              <Card data-testid="card-gate-resources">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    GATE Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gateResources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-md transition-shadow" data-testid={`resource-${resource.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2" data-testid={`text-resource-title-${resource.id}`}>
                                {resource.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3" data-testid={`text-resource-description-${resource.id}`}>
                                {resource.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" data-testid={`badge-category-${resource.id}`}>
                                    {resource.category}
                                  </Badge>
                                  <span className="flex items-center text-xs text-muted-foreground">
                                    <Download className="mr-1 h-3 w-3" />
                                    {resource.downloads}
                                  </span>
                                </div>
                                <Button size="sm" data-testid={`button-download-${resource.id}`}>
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* GATE Statistics */}
              <Card data-testid="card-gate-stats">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    GATE 2024 Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary" data-testid="text-total-registrations">
                        9.21L
                      </div>
                      <p className="text-sm text-muted-foreground">Total Registrations</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent" data-testid="text-cs-registrations">
                        2.28L
                      </div>
                      <p className="text-sm text-muted-foreground">CS Registrations</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600" data-testid="text-qualifying-marks">
                        25-50
                      </div>
                      <p className="text-sm text-muted-foreground">Qualifying Marks Range</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600" data-testid="text-exam-date">
                        Feb 2024
                      </div>
                      <p className="text-sm text-muted-foreground">Next Exam Date</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Universities Tab */}
            <TabsContent value="universities" className="space-y-6">
              <Card data-testid="card-top-universities">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <University className="mr-2 h-5 w-5" />
                    Top Universities in India
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {universityPrograms.map((university) => (
                      <Card key={university.id} className="hover:shadow-md transition-shadow" data-testid={`university-${university.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="text-4xl">{university.logo}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2" data-testid={`text-university-name-${university.id}`}>
                                {university.name}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Programs Offered</p>
                                  <div className="flex space-x-2 mt-1">
                                    {university.programs.map((program, index) => (
                                      <Badge key={index} variant="outline" data-testid={`badge-program-${university.id}-${index}`}>
                                        {program}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Admission Process</p>
                                  <p className="text-sm mt-1" data-testid={`text-admission-process-${university.id}`}>
                                    {university.admissionProcess}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-1 h-4 w-4" />
                                    Deadline: {university.deadline}
                                  </span>
                                </div>
                                <Button size="sm" variant="outline" data-testid={`button-university-website-${university.id}`}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visit Website
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Abroad Tab */}
            <TabsContent value="abroad" className="space-y-6">
              <Card data-testid="card-countries">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Popular Study Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {studyAbroadOptions.map((option) => (
                      <Card key={option.id} className="hover:shadow-md transition-shadow" data-testid={`country-${option.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="text-4xl">{option.flag}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-3" data-testid={`text-country-name-${option.id}`}>
                                {option.country}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Top Universities</p>
                                  <p className="text-sm" data-testid={`text-universities-${option.id}`}>
                                    {option.universities.join(", ")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Required Exams</p>
                                  <p className="text-sm" data-testid={`text-exams-${option.id}`}>
                                    {option.exams.join(", ")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Average Cost</p>
                                  <p className="text-sm font-semibold text-primary" data-testid={`text-cost-${option.id}`}>
                                    {option.avgCost}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Scholarships</p>
                                  <p className="text-sm" data-testid={`text-scholarships-${option.id}`}>
                                    {option.scholarships}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exam Preparation */}
              <Card data-testid="card-exam-prep">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Entrance Exam Preparation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examPreparation.map((exam, index) => (
                      <Card key={exam.exam} className="bg-secondary/50" data-testid={`exam-${index}`}>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-lg mb-3" data-testid={`text-exam-name-${index}`}>
                                {exam.exam}
                              </h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Sections</p>
                                  <p className="text-sm" data-testid={`text-exam-sections-${index}`}>
                                    {exam.sections.join(", ")}
                                  </p>
                                </div>
                                <div className="flex space-x-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                    <p className="text-sm" data-testid={`text-exam-duration-${index}`}>
                                      {exam.duration}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fee</p>
                                    <p className="text-sm font-semibold text-primary" data-testid={`text-exam-fee-${index}`}>
                                      {exam.fee}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Preparation Tips</p>
                              <p className="text-sm text-muted-foreground mb-3" data-testid={`text-exam-tips-${index}`}>
                                {exam.tips}
                              </p>
                              <Badge variant="outline" data-testid={`badge-exam-validity-${index}`}>
                                Valid for: {exam.validity}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Success Stories */}
          <Card data-testid="card-success-stories">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Success Stories from Alumni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200" data-testid="story-1">
                  <p className="text-sm italic mb-3">
                    "GATE preparation helped me get into IIT Bombay for M.Tech. The systematic approach and mock tests were crucial for my success."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-medium text-sm">Arjun Sharma</p>
                      <p className="text-xs text-muted-foreground">M.Tech at IIT Bombay</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200" data-testid="story-2">
                  <p className="text-sm italic mb-3">
                    "The GRE preparation resources and guidance helped me secure admission at Stanford University with a full scholarship."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <div>
                      <p className="font-medium text-sm">Priya Patel</p>
                      <p className="text-xs text-muted-foreground">MS at Stanford University</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
