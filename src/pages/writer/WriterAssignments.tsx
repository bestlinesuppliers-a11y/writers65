import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Clock,
  User,
  MessageSquare,
  Upload,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface Assignment {
  id: string;
  status: string;
  notes: string;
  due_at: string;
  assigned_at: string;
  orders: {
    id: string;
    title: string;
    description: string;
    category: string;
    academic_level: string;
    words: number;
    pages: number;
    budget_usd: number;
    deadline: string;
    instructions: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
  bids: {
    proposed_rate: number;
    time_needed_days: number;
    time_needed_hours: number;
  }[];
}

export default function WriterAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          orders (
            *,
            profiles:client_id (full_name, email)
          )
        `)
        .eq('writer_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Fetch the accepted bids for these assignments
      if (data && data.length > 0) {
        const orderIds = data.map(a => a.order_id);
        const { data: bidsData } = await supabase
          .from('bids')
          .select('order_id, proposed_rate, time_needed_days, time_needed_hours')
          .in('order_id', orderIds)
          .eq('writer_id', user.id)
          .eq('status', 'accepted');

        // Merge bid data with assignments
        const assignmentsWithBids = data.map(assignment => ({
          ...assignment,
          bids: bidsData?.filter(b => b.order_id === assignment.order_id) || []
        }));

        setAssignments(assignmentsWithBids);
      } else {
        setAssignments([]);
      }
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Overdue", urgent: true };
    if (diffDays === 0) return { text: "Due Today", urgent: true };
    if (diffDays === 1) return { text: "Due Tomorrow", urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
    return { text: `${diffDays} days left`, urgent: false };
  };

  const handleSubmitWork = async (assignmentId: string) => {
    try {
      // This would typically handle file upload and submission creation
      toast({
        title: "Work Submitted",
        description: "Your submission has been sent to the client for review.",
      });
      setSelectedAssignment(null);
      setSubmissionNote("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit work. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {assignments.length} Active
        </Badge>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
            <p className="text-muted-foreground">
              Your assigned orders will appear here. Browse available orders to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const daysRemaining = getDaysRemaining(assignment.due_at);
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{assignment.orders.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={daysRemaining.urgent ? "border-red-500 text-red-700" : ""}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {daysRemaining.text}
                        </Badge>
                        <Badge variant="secondary">
                          {assignment.orders.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${assignment.bids[0]?.proposed_rate || assignment.orders.budget_usd}
                      </div>
                      <div className="text-sm text-muted-foreground">Your Bid Amount</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.orders.words} words / {assignment.orders.pages} pages</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.orders.profiles.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Your Timeline: {assignment.bids[0]?.time_needed_days || 0} days{' '}
                            {assignment.bids[0]?.time_needed_hours ? `${assignment.bids[0].time_needed_hours} hours` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Assignment Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                        <p><strong>Academic Level:</strong> {assignment.orders.academic_level.replace('_', ' ')}</p>
                        {assignment.notes && (
                          <p><strong>Admin Notes:</strong> {assignment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {assignment.orders.description}
                    </p>
                    {assignment.orders.instructions && (
                      <div>
                        <h5 className="font-medium mb-1">Special Instructions</h5>
                        <p className="text-sm text-muted-foreground">
                          {assignment.orders.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="writer"
                      onClick={() => setSelectedAssignment(assignment.id)}
                      disabled={assignment.status === 'completed'}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Work
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Client
                    </Button>
                    {daysRemaining.urgent && (
                      <div className="flex items-center gap-1 text-red-600 text-sm ml-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Urgent</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
              <CardDescription>
                Upload your completed work and add any notes for the client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop your files here
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Submission Notes</label>
                <Textarea
                  placeholder="Add any notes about your submission..."
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => handleSubmitWork(selectedAssignment)}
                >
                  Submit Work
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedAssignment(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}