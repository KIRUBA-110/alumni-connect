import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, TrendingUp, Users, Building2, Award, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlacementSchema } from "@shared/schema";
import type { InsertPlacement } from "@shared/schema";
import { PlacementForm } from "@/components/placement-form";

export default function Placements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: placements, isLoading } = useQuery({
    queryKey: ["/api/placements"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/placements/stats"],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/alumni"],
    queryFn: () => fetch("/api/alumni").then(res => res.json()),
    enabled: user?.role === "staff",
  });

  const form = useForm<InsertPlacement>({
    resolver: zodResolver(insertPlacementSchema),
    defaultValues: {
      studentId: "",
      company: "",
      role: "",
      package: 0,
      placementType: "full_time",
      year: new Date().getFullYear(),
    },
  });

  const createPlacementMutation = useMutation({
    mutationFn: async (data: InsertPlacement) => {
      const response = await apiRequest("POST", "/api/placements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/placements/stats"] });
      form.reset();
      toast({
        title: "Success",
        description: "Placement record added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add placement",
        variant: "destructive",
      });
    },
  });

  const onCreatePlacement = (data: InsertPlacement) => {
    createPlacementMutation.mutate(data);
  };

  const formatPackage = (amount: number) => {
    return `₹${amount}L`;
  };

  const getPackageColor = (amount: number) => {
    if (amount >= 15) return "text-green-600 bg-green-50";
    if (amount >= 10) return "text-blue-600 bg-blue-50";
    if (amount >= 6) return "text-orange-600 bg-orange-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="placements-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Placement Statistics</h1>
              <p className="text-muted-foreground">Track placement progress and company details</p>
            </div>
            
            {user?.role === "staff" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-placement">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Placement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Placement Record</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onCreatePlacement)} className="space-y-4" data-testid="form-add-placement">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student</Label>
                      <Select onValueChange={(value) => form.setValue("studentId", value)}>
                        <SelectTrigger data-testid="select-student">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students?.filter((s: any) => s.role === "student").map((student: any) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.fullName || student.username} ({student.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          {...form.register("company")}
                          placeholder="e.g., TCS, Google"
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="package">Package (LPA)</Label>
                        <Input
                          id="package"
                          type="number"
                          step="0.1"
                          {...form.register("package", { valueAsNumber: true })}
                          placeholder="e.g., 8.5"
                          data-testid="input-package"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="placementType">Type</Label>
                        <Select onValueChange={(value) => form.setValue("placementType", value as any)}>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          {...form.register("year", { valueAsNumber: true })}
                          placeholder="2024"
                          data-testid="input-year"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={createPlacementMutation.isPending} data-testid="button-submit-placement">
                      {createPlacementMutation.isPending ? "Adding..." : "Add Placement"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Student Placement Form */}
          {(user?.role === "student" || user?.role === "alumni") && (
            <PlacementForm />
          )}

          {/* Statistics Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" data-testid="card-total-placements">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-total-placements">
                    {stats.totalPlacements}
                  </div>
                  <p className="text-sm text-muted-foreground">Students Placed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200" data-testid="card-placement-rate">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="text-placement-rate">
                    {Math.round(stats.placementRate)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Placement Rate</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" data-testid="card-average-package">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600" data-testid="text-average-package">
                    {formatPackage(stats.averagePackage)}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Package</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200" data-testid="card-highest-package">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600" data-testid="text-highest-package">
                    {formatPackage(stats.highestPackage)}
                  </div>
                  <p className="text-sm text-muted-foreground">Highest Package</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Recruiting Companies */}
          {stats && stats.companyStats && stats.companyStats.length > 0 && (
            <Card data-testid="card-top-companies">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Top Recruiting Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.companyStats.slice(0, 10).map((company: any, index: number) => (
                    <div key={company.company} className="flex items-center justify-between p-4 bg-secondary rounded-lg" data-testid={`company-${index}`}>
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary text-primary-foreground w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                          {company.company.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium" data-testid={`text-company-name-${index}`}>
                            {company.company}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-company-count-${index}`}>
                            {company.count} students placed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-company-range-${index}`}>
                          {formatPackage(company.minPackage)} - {formatPackage(company.maxPackage)}
                        </p>
                        <p className="text-sm text-muted-foreground">Package Range</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Placements */}
          <Card data-testid="card-recent-placements">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Recent Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8" data-testid="loading-placements">
                  <p className="text-muted-foreground">Loading placements...</p>
                </div>
              ) : placements && placements.length > 0 ? (
                <div className="space-y-4">
                  {placements.slice(0, 10).map((placement: any) => (
                    <div key={placement.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow" data-testid={`placement-${placement.id}`}>
                      <div className="flex items-center space-x-4">
                        <div className="bg-accent text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold">
                          {(placement.student.fullName || placement.student.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium" data-testid={`text-student-name-${placement.id}`}>
                            {placement.student.fullName || placement.student.username}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-student-department-${placement.id}`}>
                            {placement.student.department} • Class of {placement.student.graduationYear}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold" data-testid={`text-placement-company-${placement.id}`}>
                          {placement.company}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-placement-role-${placement.id}`}>
                          {placement.role}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPackageColor(placement.package)}`}>
                          <DollarSign className="mr-1 h-3 w-3" />
                          <span data-testid={`text-placement-package-${placement.id}`}>
                            {formatPackage(placement.package)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" size="sm" data-testid={`badge-placement-type-${placement.id}`}>
                            {placement.placementType === "full_time" ? "Full Time" : "Internship"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="no-placements">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Placement Records</h3>
                  <p className="text-muted-foreground">
                    No placement records have been added yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Distribution */}
          {placements && placements.length > 0 && (
            <Card data-testid="card-package-distribution">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Package Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600" data-testid="text-high-package-count">
                      {placements.filter((p: any) => p.package >= 15).length}
                    </div>
                    <p className="text-sm text-muted-foreground">₹15L+ Packages</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-mid-high-package-count">
                      {placements.filter((p: any) => p.package >= 10 && p.package < 15).length}
                    </div>
                    <p className="text-sm text-muted-foreground">₹10L-15L Packages</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600" data-testid="text-mid-package-count">
                      {placements.filter((p: any) => p.package >= 6 && p.package < 10).length}
                    </div>
                    <p className="text-sm text-muted-foreground">₹6L-10L Packages</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600" data-testid="text-entry-package-count">
                      {placements.filter((p: any) => p.package < 6).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Below ₹6L Packages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
