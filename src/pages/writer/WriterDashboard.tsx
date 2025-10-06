import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Order {
  id: string;
  title: string;
  description: string;
  category: string;
  academic_level: string;
  words: number;
  pages: number;
  budget_usd: number;
  deadline: string;
  created_at: string;
  referencing_style: string;
  profiles: {
    full_name: string;
  };
}

interface UserProfile {
  full_name: string;
  email: string;
}

export default function WriterDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [proposedRate, setProposedRate] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Fetch available orders
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_client_id_fkey (full_name)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleBidOrder = async (order: Order) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if writer already has a bid for this order
      const { data: existingBids, error } = await supabase
        .from('bids')
        .select('*')
        .eq('order_id', order.id)
        .eq('writer_id', user.id)
        .neq('status', 'rejected')
        .neq('status', 'withdrawn');

      if (error) throw error;

      if (existingBids && existingBids.length > 0) {
        // Edit existing bid
        const bid = existingBids[0];
        setExistingBid(bid);
        setIsEditMode(true);
        setProposedRate(bid.proposed_rate?.toString() || order.budget_usd.toString());
        setCoverLetter(bid.cover_letter || "");
      } else {
        // Create new bid
        setExistingBid(null);
        setIsEditMode(false);
        setProposedRate(order.budget_usd.toString());
        setCoverLetter("");
      }

      setSelectedOrder(order);
      setBidDialogOpen(true);
    } catch (error) {
      console.error('Error checking existing bids:', error);
      toast({
        title: "Error",
        description: "Failed to load bid information",
        variant: "destructive",
      });
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedOrder || !proposedRate) {
      toast({
        title: "Error",
        description: "Please enter a proposed rate",
        variant: "destructive",
      });
      return;
    }

    setSubmittingBid(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isEditMode && existingBid) {
        // Update existing bid
        const { error } = await supabase
          .from('bids')
          .update({
            proposed_rate: parseFloat(proposedRate),
            cover_letter: coverLetter,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBid.id);

        if (error) throw error;

        toast({
          title: "Bid Updated",
          description: "Your bid has been updated successfully.",
        });
      } else {
        // Create new bid
        const { error } = await supabase
          .from('bids')
          .insert({
            order_id: selectedOrder.id,
            writer_id: user.id,
            proposed_rate: parseFloat(proposedRate),
            cover_letter: coverLetter,
          });

        if (error) throw error;

        toast({
          title: "Bid Submitted",
          description: "Your bid has been submitted successfully. The client will review it shortly.",
        });
      }

      setBidDialogOpen(false);
      setSelectedOrder(null);
      setProposedRate("");
      setCoverLetter("");
      setExistingBid(null);
      setIsEditMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'submit'} bid. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatAcademicLevel = (level: string) => {
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    const remainingMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffTime < 0) return { text: "Overdue", color: "text-red-600" };
    if (diffDays === 0) {
      return { 
        text: `${diffHours}h ${remainingMinutes}m`, 
        color: "text-orange-600" 
      };
    }
    if (diffDays < 7) {
      return { 
        text: `${diffDays}d ${remainingHours}h`, 
        color: "text-yellow-600" 
      };
    }
    return { 
      text: `${diffDays} days`, 
      color: "text-green-600" 
    };
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with User Info and Time */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">24 Writers</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Company's time: {getCurrentTime()}</p>
          <p className="text-sm text-muted-foreground">Your time: {getCurrentTime()}</p>
        </div>
        <div className="flex items-center gap-3">
          {userProfile && (
            <>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {userProfile.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{userProfile.full_name}</span>
              <Button variant="outline" size="sm">Sign out</Button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? "No available orders at the moment." 
                  : "No orders match your search."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type of work</TableHead>
                    <TableHead>Spacing</TableHead>
                    <TableHead>Order Total</TableHead>
                    <TableHead>Pages/Word count</TableHead>
                    <TableHead>Deadline / time left</TableHead>
                    <TableHead>Additional info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const deadlineInfo = formatDeadline(order.deadline);
                    return (
                      <TableRow 
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleBidOrder(order)}
                      >
                        <TableCell className="font-mono text-sm">
                          {order.id.substring(0, 6)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium line-clamp-1">{order.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatAcademicLevel(order.academic_level)}</Badge>
                        </TableCell>
                        <TableCell>{order.referencing_style || 'Double'}</TableCell>
                        <TableCell className="font-semibold">
                          ${order.budget_usd}
                        </TableCell>
                        <TableCell>
                          {order.pages}p/ {order.words} words
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {new Date(order.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className={`text-sm font-medium ${deadlineInfo.color}`}>
                              {deadlineInfo.text}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Additional info column - removed search icon */}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="p-4 text-sm text-muted-foreground border-t">
                Results: one page
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Your Bid' : 'Place a Bid'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update your bid for: ' : 'Submit your bid for: '}{selectedOrder?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Budget</Label>
                <p className="text-lg font-semibold text-green-600">
                  ${selectedOrder?.budget_usd}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Deadline</Label>
                <p className="text-lg font-semibold">
                  {selectedOrder && new Date(selectedOrder.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="proposedRate">Your Proposed Rate ($)*</Label>
              <Input
                id="proposedRate"
                type="number"
                step="0.01"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                placeholder="Enter your rate"
              />
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you're the best fit for this order..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid} disabled={submittingBid}>
              {submittingBid ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update Bid" : "Submit Bid")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
