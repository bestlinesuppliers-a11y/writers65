import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { User, Star, Upload, Check, X, FileText, DollarSign } from "lucide-react";

interface WriterProfile {
  id: string;
  user_id: string;
  bio: string;
  skills: string[];
  categories: string[];
  hourly_rate: number;
  per_page_rate: number;
  availability: boolean;
  verification_status: string;
  rating: number;
  completed_orders: number;
  portfolio_items: string[];
  payout_method: string;
  payout_details: any;
}

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

export default function WriterProfile() {
  const [writerProfile, setWriterProfile] = useState<WriterProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [perPageRate, setPerPageRate] = useState<number>(0);
  const [availability, setAvailability] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: userProfileData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch writer profile
      const { data: writerProfileData, error: writerError } = await supabase
        .from('writer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (writerError && writerError.code !== 'PGRST116') throw writerError;

      setUserProfile(userProfileData);
      setWriterProfile(writerProfileData);

      // Set form states
      if (userProfileData) {
        setFullName(userProfileData.full_name || "");
        setPhone(userProfileData.phone || "");
      }

      if (writerProfileData) {
        setBio(writerProfileData.bio || "");
        setSkills(writerProfileData.skills || []);
        setCategories(writerProfileData.categories || []);
        setHourlyRate(writerProfileData.hourly_rate || 0);
        setPerPageRate(writerProfileData.per_page_rate || 0);
        setAvailability(writerProfileData.availability ?? true);
        setPayoutMethod(writerProfileData.payout_method || "");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user profile
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update or create writer profile
      const writerData = {
        user_id: user.id,
        bio,
        skills,
        categories,
        hourly_rate: hourlyRate,
        per_page_rate: perPageRate,
        availability,
        payout_method: payoutMethod,
      };

      if (writerProfile) {
        const { error: writerError } = await supabase
          .from('writer_profiles')
          .update(writerData)
          .eq('user_id', user.id);

        if (writerError) throw writerError;
      } else {
        const { error: writerError } = await supabase
          .from('writer_profiles')
          .insert(writerData);

        if (writerError) throw writerError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setEditMode(false);
      fetchProfiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Writer Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional profile and settings
          </p>
        </div>
        <Button
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={saving}
        >
          {editMode ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
        </Button>
      </div>

      {/* Verification Status */}
      {writerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getVerificationColor(writerProfile.verification_status)}>
              {writerProfile.verification_status === 'verified' && <Check className="mr-1 h-3 w-3" />}
              {writerProfile.verification_status === 'pending' && <FileText className="mr-1 h-3 w-3" />}
              {writerProfile.verification_status === 'rejected' && <X className="mr-1 h-3 w-3" />}
              {writerProfile.verification_status.charAt(0).toUpperCase() + writerProfile.verification_status.slice(1)}
            </Badge>
            {writerProfile.verification_status === 'pending' && (
              <p className="text-sm text-muted-foreground mt-2">
                Your profile is under review. You'll be notified once verification is complete.
              </p>
            )}
            {writerProfile.verification_status === 'rejected' && (
              <p className="text-sm text-red-600 mt-2">
                Your profile was not approved. Please contact support for more information.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userProfile?.email || ""}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="availability"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                disabled={!editMode}
              />
              <Label htmlFor="availability">Available for new orders</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!editMode}
              placeholder="Tell clients about your experience and expertise..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                disabled={!editMode}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="perPageRate">Per Page Rate ($)</Label>
              <Input
                id="perPageRate"
                type="number"
                value={perPageRate}
                onChange={(e) => setPerPageRate(Number(e.target.value))}
                disabled={!editMode}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                  {editMode && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editMode && (
              <Input
                placeholder="Add a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            )}
          </div>

          {/* Categories */}
          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline">
                  {category}
                  {editMode && (
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-2 text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editMode && (
              <Input
                placeholder="Add a category and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCategory(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {writerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{writerProfile.rating.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{writerProfile.completed_orders}</div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {writerProfile.completed_orders > 0 ? '95%' : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payout Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="payoutMethod">Preferred Payout Method</Label>
            <select
              id="payoutMethod"
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              disabled={!editMode}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select method...</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}