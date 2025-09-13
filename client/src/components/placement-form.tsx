import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2 } from "lucide-react";

interface PlacementFormData {
  company: string;
  role: string;
  package: number;
  placementType: "full_time" | "internship";
  year: number;
}

export function PlacementForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PlacementFormData>({
    company: "",
    role: "",
    package: 0,
    placementType: "full_time",
    year: new Date().getFullYear(),
  });

  const addPlacementMutation = useMutation({
    mutationFn: async (data: PlacementFormData) => {
      const response = await fetch("/api/placements/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add placement");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your placement information has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/placements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/placements/stats"] });
      // Reset form
      setFormData({
        company: "",
        role: "",
        package: 0,
        placementType: "full_time",
        year: new Date().getFullYear(),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add placement information",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role || formData.package <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addPlacementMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PlacementFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (user?.role !== "student" && user?.role !== "alumni") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Only students and alumni can add placement information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Add Your Placement Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="e.g., Google, Microsoft, Amazon"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Data Analyst"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package">Package (in LPA) *</Label>
              <Input
                id="package"
                type="number"
                placeholder="e.g., 12"
                min="0"
                step="0.1"
                value={formData.package || ""}
                onChange={(e) => handleInputChange("package", parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placementType">Type *</Label>
              <Select
                value={formData.placementType}
                onValueChange={(value: "full_time" | "internship") => 
                  handleInputChange("placementType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 2024"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => handleInputChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={addPlacementMutation.isPending}
            className="w-full"
          >
            {addPlacementMutation.isPending ? "Adding..." : "Add Placement Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
