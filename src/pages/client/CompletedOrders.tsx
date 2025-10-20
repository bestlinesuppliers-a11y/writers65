import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Star, User, FileText, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompletedOrder {
  id: string;
  title: string;
  description: string;
  category: string;
  academic_level: string;
  words: number;
  pages: number;
  deadline: string;
  budget_usd: number;
  completed_at: string;
  created_at: string;
  assignments: Array<{
    writer_id: string;
    profiles: {
      full_name: string;
    };
  }> | null;
  submissions: Array<{
    id: string;
    files: string[];
    submitted_at: string;
    is_final: boolean;
    message: string;
  }>;
}

export default function CompletedOrders() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          assignments (
            writer_id,
            profiles (full_name)
          ),
          submissions (
            id,
            files,
            submitted_at,
            is_final,
            message
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch completed orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const submitRating = async () => {
    if (!selectedOrder) return;

    try {
      // In a real app, you'd have a ratings table
      // For now, we'll just show success
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });

      setShowRatingModal(false);
      setSelectedOrder(null);
      setRating(5);
      setReview("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const getTurnaroundTime = (createdAt: string, completedAt: string) => {
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffTime = Math.abs(completed.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFinalSubmission = (submissions: any[]) => {
    return submissions.find(sub => sub.is_final) || submissions[submissions.length - 1];
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
      <div>
        <h1 className="text-3xl font-bold">Completed Orders</h1>
        <p className="text-muted-foreground">
          Review your finished projects and download deliverables
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              Projects finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, order) => sum + Number(order.budget_usd), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.length > 0 ? 
                Math.round(orders.reduce((sum, order) => 
                  sum + getTurnaroundTime(order.created_at, order.completed_at), 0) / orders.length)
                : 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average delivery time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const finalSubmission = getFinalSubmission(order.submissions);
          const turnaroundTime = getTurnaroundTime(order.created_at, order.completed_at);

          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.title}</CardTitle>
                    <CardDescription>
                      {order.category} • {order.academic_level.replace('_', ' ')} • 
                      {order.words} words ({order.pages} pages)
                      <br />
                      Completed {format(new Date(order.completed_at), "PPP")} • 
                      Turnaround: {turnaroundTime} days
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <FileText className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Writer: {order.assignments?.[0]?.profiles?.full_name || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Submitted: {finalSubmission ? 
                        format(new Date(finalSubmission.submitted_at), "PPp") : 
                        'No submission'}
                    </span>
                  </div>
                </div>

                {finalSubmission && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Final Submission:</h4>
                    {finalSubmission.message && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {finalSubmission.message}
                      </p>
                    )}
                    
                    {finalSubmission.files && finalSubmission.files.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Files:</h5>
                        <div className="flex flex-wrap gap-2">
                          {finalSubmission.files.map((file, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(file)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {file.split('/').pop()}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-lg font-semibold text-primary">
                    ${order.budget_usd}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowRatingModal(true);
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Rate Writer
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No completed orders</h3>
            <p className="text-muted-foreground">
              Your completed projects will appear here once they're finished.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>
                How was your experience with {selectedOrder.assignments?.[0]?.profiles?.full_name}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review">Review (Optional)</Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={submitRating} className="flex-1">
                  Submit Rating
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}