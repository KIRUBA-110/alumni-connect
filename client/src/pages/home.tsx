import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { 
  GraduationCap, 
  Rocket, 
  Play, 
  TrendingUp, 
  Users, 
  Brain,
  Calendar
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/feed");
    }
  }, [user, setLocation]);

  if (user) {
    return null; // Will redirect to feed
  }

  const features = [
    {
      icon: Users,
      title: "Alumni Network",
      description: "Connect with successful alumni from your field and get mentorship",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Brain,
      title: "Skill Assessments", 
      description: "Test your knowledge with MCQ-based assessments and compare with alumni",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Placement Tracking",
      description: "Track placement statistics and salary trends across companies",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Calendar,
      title: "Events & Activities",
      description: "Stay updated with college events, tech fests, and cultural activities",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12" data-testid="hero-section">
        <div className="relative bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
              Welcome to Alumni Connect
            </h1>
            <p className="text-xl mb-6 opacity-90" data-testid="text-hero-description">
              Bridge the gap between students and successful alumni. Get mentorship, prepare for placements, and build your career network.
            </p>
            <div className="flex space-x-4">
              <Button 
                className="bg-accent text-accent-foreground px-6 py-3 hover:bg-green-600"
                onClick={() => setLocation("/auth")}
                data-testid="button-get-started"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            <Button 
  variant="outline" 
  className="bg-blue-600 border-blue-600 text-white px-6 py-3 hover:bg-blue-700 hover:border-blue-700"
  data-testid="button-learn-more"
>
  <Play className="mr-2 h-4 w-4" />
  Learn More
</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        {/* Main Content */}
        <main className="lg:col-span-3 space-y-8">
          {/* Features Section */}
          <section data-testid="features-section">
            <h2 className="text-3xl font-bold text-center mb-8">
              Why Choose Alumni Connect?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${feature.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2" data-testid={`text-feature-title-${index}`}>
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-card rounded-xl border border-border p-8" data-testid="stats-section">
            <h2 className="text-2xl font-bold text-center mb-8">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-alumni">500+</div>
                <p className="text-sm text-muted-foreground">Active Alumni</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent" data-testid="text-stat-students">2000+</div>
                <p className="text-sm text-muted-foreground">Students Connected</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600" data-testid="text-stat-placements">87%</div>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600" data-testid="text-stat-companies">150+</div>
                <p className="text-sm text-muted-foreground">Partner Companies</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-accent to-green-600 rounded-xl p-8 text-white text-center" data-testid="cta-section">
            <GraduationCap className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-2xl font-bold mb-4" data-testid="text-cta-title">
              Ready to Connect with Alumni?
            </h2>
            <p className="text-lg mb-6 opacity-90" data-testid="text-cta-description">
              Join thousands of students who have found their dream careers through our platform.
            </p>
            <Button 
              className="bg-white text-accent px-8 py-3 hover:bg-gray-100"
              onClick={() => setLocation("/auth")}
              data-testid="button-join-now"
            >
              Join Now - It's Free!
            </Button>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-primary mb-4">
                <GraduationCap className="inline mr-2" />
                Alumni Connect
              </div>
              <p className="text-muted-foreground text-sm">
                Bridging the gap between students and successful alumni for career growth and mentorship.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Alumni Feed</a></li>
                <li><a href="#" className="hover:text-primary">Find Mentors</a></li>
                <li><a href="#" className="hover:text-primary">Take Assessments</a></li>
                <li><a href="#" className="hover:text-primary">Interview Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Placement Statistics</a></li>
                <li><a href="#" className="hover:text-primary">GATE Preparation</a></li>
                <li><a href="#" className="hover:text-primary">Events & Gallery</a></li>
                <li><a href="#" className="hover:text-primary">Study Abroad</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📧 contact@alumniconnect.edu</p>
                <p>📞 +91 99999 88888</p>
                <p>📍 College Campus, City</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Alumni Connect. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
