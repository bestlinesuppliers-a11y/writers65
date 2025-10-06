import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Bid {
  id: string;
  order_id: string;
  proposed_rate: number;
  status: string;
  created_at: string;
  cover_letter: string;
  orders: {
    title: string;
    deadline: string;
    category: string;
  };
}

export default function MyBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingBid, setWithdrawingBid] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          orders (
            title,
            deadline,
            category
          )
        `)
        .eq('writer_id', user.id)
        .neq('status', 'accepted')
        .neq('status', 'rejected')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your bids.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status: 'withdrawn' })
        .eq('id', bidId);

      if (error) throw error;

      toast({
        title: "Bid Withdrawn",
        description: "Your bid has been withdrawn successfully.",
      });

      fetchBids();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWithdrawingBid(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bids</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {bids.length} Total Bids
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {bids.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You haven't placed any bids yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Your Bid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium line-clamp-1">
                          {bid.orders.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bid.orders.category}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${bid.proposed_rate}
                    </TableCell>
                    <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    <TableCell>
                      {new Date(bid.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {bid.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWithdrawingBid(bid.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!withdrawingBid} onOpenChange={() => setWithdrawingBid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Bid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this bid? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => withdrawingBid && handleWithdrawBid(withdrawingBid)}>
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
