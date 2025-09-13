import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import type { InsertUser, LoginCredentials } from "@shared/schema";

export default function Auth() {
  const { login, register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "student",
      department: "",
      graduationYear: new Date().getFullYear(),
      college: "",
      company: "",
      position: "",
      location: "",
      bio: "",
    },
  });

  const onLogin = async (data: LoginCredentials) => {
    try {
      await login(data);
      setLocation("/feed");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onRegister = async (data: InsertUser) => {
    try {
      await register(data);
      setLocation("/feed");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4" data-testid="auth-page">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Alumni Connect</CardTitle>
          <CardDescription>
            Connect with alumni, grow your career, and build meaningful relationships
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="form-login">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    {...loginForm.register("username")}
                    placeholder="Enter your username"
                    data-testid="input-login-username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-destructive" data-testid="error-login-username">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="Enter your password"
                    data-testid="input-login-password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive" data-testid="error-login-password">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" data-testid="form-register">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerForm.register("username")}
                      placeholder="Choose a username"
                      data-testid="input-register-username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive" data-testid="error-register-username">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      {...registerForm.register("email")}
                      placeholder="your.email@domain.com"
                      data-testid="input-register-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive" data-testid="error-register-email">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                      placeholder="Create a password"
                      data-testid="input-register-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive" data-testid="error-register-password">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-fullName">Full Name</Label>
                    <Input
                      id="register-fullName"
                      {...registerForm.register("fullName")}
                      placeholder="Your full name"
                      data-testid="input-register-fullname"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive" data-testid="error-register-fullname">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <Select onValueChange={(value) => registerForm.setValue("role", value as any)}>
                      <SelectTrigger data-testid="select-register-role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="staff">Placement Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    {registerForm.formState.errors.role && (
                      <p className="text-sm text-destructive" data-testid="error-register-role">
                        {registerForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-department">Department</Label>
                    <Input
                      id="register-department"
                      {...registerForm.register("department")}
                      placeholder="e.g., Computer Science"
                      data-testid="input-register-department"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-graduationYear">Graduation Year</Label>
                    <Input
                      id="register-graduationYear"
                      type="number"
                      {...registerForm.register("graduationYear", { valueAsNumber: true })}
                      placeholder="2024"
                      data-testid="input-register-graduation-year"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-college">College</Label>
                    <Input
                      id="register-college"
                      {...registerForm.register("college")}
                      placeholder="e.g., MIT, Stanford University"
                      data-testid="input-register-college"
                    />
                    {registerForm.formState.errors.college && (
                      <p className="text-sm text-destructive" data-testid="error-register-college">
                        {registerForm.formState.errors.college.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-location">Location</Label>
                  <Input
                    id="register-location"
                    {...registerForm.register("location")}
                    placeholder="City, Country"
                    data-testid="input-register-location"
                  />
                </div>
                
                {/* Show company/position fields for alumni */}
                {registerForm.watch("role") === "alumni" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-company">Company</Label>
                      <Input
                        id="register-company"
                        {...registerForm.register("company")}
                        placeholder="Current company"
                        data-testid="input-register-company"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-position">Position</Label>
                      <Input
                        id="register-position"
                        {...registerForm.register("position")}
                        placeholder="Job title"
                        data-testid="input-register-position"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="register-bio">Bio (Optional)</Label>
                  <Textarea
                    id="register-bio"
                    {...registerForm.register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    data-testid="input-register-bio"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
