import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { 
  User, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  GraduationCap,
  Edit3,
  Save,
  X
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    college: user?.college || "",
    bio: user?.bio || "",
    location: user?.location || "",
    company: user?.company || "",
    position: user?.position || "",
    department: user?.department || "",
    graduationYear: user?.graduationYear || "",
  });

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      college: user?.college || "",
      bio: user?.bio || "",
      location: user?.location || "",
      company: user?.company || "",
      position: user?.position || "",
      department: user?.department || "",
      graduationYear: user?.graduationYear || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar />
        
        <main className="lg:col-span-3 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {user.fullName?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {user.fullName || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {user.location || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  {isEditing ? (
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="Your College Name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {user.college || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  {isEditing ? (
                    <Input
                      id="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      placeholder="2023"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {user.graduationYear || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.bio || "No bio provided"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Computer Science"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {user.department || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Google, Microsoft, etc."
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      {user.company || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Software Engineer, Product Manager, etc."
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {user.position || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
