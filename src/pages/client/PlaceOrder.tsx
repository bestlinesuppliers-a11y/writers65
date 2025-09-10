import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    academicLevel: "",
    words: 0,
    pages: 0,
    deadline: "",
    instructions: "",
    referencingStyle: "",
    budgetUsd: 0,
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = [
    "Essays", "Research Papers", "Dissertations", "Business Writing",
    "Technical Writing", "Creative Writing", "Academic Writing", "Other"
  ];

  const academicLevels = [
    "high_school", "undergraduate", "graduate", "phd", "professional"
  ];

  const referencingStyles = [
    "APA", "MLA", "Chicago", "Harvard", "IEEE", "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to place an order",
          variant: "destructive",
        });
        return;
      }

      // Upload attachments if any
      const uploadedAttachments: string[] = [];
      for (const file of attachments) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('order-attachments')
          .upload(fileName, file);

        if (!uploadError) {
          uploadedAttachments.push(fileName);
        }
      }

      // Create the order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          academic_level: formData.academicLevel as "high_school" | "undergraduate" | "masters" | "phd" | "professional",
          words: formData.words,
          pages: formData.pages,
          deadline: formData.deadline,
          instructions: formData.instructions,
          referencing_style: formData.referencingStyle,
          budget_usd: formData.budgetUsd,
          client_id: user.id,
          attachments: uploadedAttachments,
          status: 'pending_payment',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order created successfully! Redirecting to payment...",
      });

      // Redirect to payment page (to be implemented)
      navigate('/client/orders');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePages = (words: number) => {
    return Math.ceil(words / 250); // Assuming 250 words per page
  };

  const calculateBudget = () => {
    const baseRate = {
      high_school: 15,
      undergraduate: 20,
      graduate: 25,
      phd: 30,
      professional: 35,
    }[formData.academicLevel] || 20;

    const urgencyMultiplier = () => {
      if (!formData.deadline) return 1;
      const daysUntilDeadline = Math.ceil(
        (new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline <= 1) return 3;
      if (daysUntilDeadline <= 3) return 2;
      if (daysUntilDeadline <= 7) return 1.5;
      return 1;
    };

    return Math.ceil(formData.pages * baseRate * urgencyMultiplier());
  };

  const handleWordsChange = (words: number) => {
    const pages = calculatePages(words);
    setFormData(prev => ({ 
      ...prev, 
      words, 
      pages,
      budgetUsd: calculateBudget()
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Place New Order</h1>
        <p className="text-muted-foreground">
          Describe your project requirements and get matched with qualified writers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a clear, descriptive title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a brief overview of your project"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="academicLevel">Academic Level *</Label>
                <select
                  id="academicLevel"
                  value={formData.academicLevel}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    academicLevel: e.target.value,
                    budgetUsd: calculateBudget()
                  }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select level...</option>
                  {academicLevels.map(level => (
                    <option key={level} value={level}>
                      {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="words">Word Count *</Label>
                <Input
                  id="words"
                  type="number"
                  value={formData.words}
                  onChange={(e) => handleWordsChange(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pages">Pages (calculated)</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    deadline: e.target.value,
                    budgetUsd: calculateBudget()
                  }))}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Detailed Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Provide specific requirements, guidelines, and any additional information"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="referencingStyle">Referencing Style</Label>
              <select
                id="referencingStyle"
                value={formData.referencingStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, referencingStyle: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select style...</option>
                {referencingStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="attachments">Upload Files (Optional)</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG (Max 10MB each)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>
              Price is calculated based on academic level, word count, and deadline urgency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${formData.budgetUsd}
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated total cost
                </p>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base rate per page:</span>
                  <span>${academicLevels.includes(formData.academicLevel) ? 
                    { high_school: 15, undergraduate: 20, graduate: 25, phd: 30, professional: 35 }[formData.academicLevel] : 20}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Number of pages:</span>
                  <span>{formData.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Urgency multiplier:</span>
                  <span>
                    {formData.deadline ? (() => {
                      const days = Math.ceil((new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      if (days <= 1) return '3x';
                      if (days <= 3) return '2x';
                      if (days <= 7) return '1.5x';
                      return '1x';
                    })() : '1x'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/client')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating Order...' : 'Place Order & Proceed to Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
}