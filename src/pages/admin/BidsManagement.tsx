import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Download, FileText } from "lucide-react";

interface Bid {
  id: string;
  order_id: string;
  writer_id: string;
  price_per_page: number;
  proposed_rate: number;
  time_needed_days: number;
  time_needed_hours: number;
  cover_letter: string;
  status: string;
  created_at: string;
  orders: {
    id: string;
    title: string;
    category: string;
    pages: number;
    words: number;
    deadline: string;
    attachments: string[];
    instructions: string;
    description: string;
    academic_level: string;
    referencing_style: string;
    sources: number;
    status: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function BidsManagement() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          orders (
            id,
            title,
            category,
            pages,
            words,
            deadline,
            attachments,
            instructions,
            description,
            academic_level,
            referencing_style,
            sources,
            status
          ),
          writer:profiles!bids_writer_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((bid: any) => ({
        ...bid,
        profiles: bid.writer
      }));
      
      setBids(transformedData);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bids.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (bidId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', bidId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bid ${status} successfully.`,
      });

      setDetailsOpen(false);
      fetchBids();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${status} bid.`,
        variant: "destructive",
      });
    }
  };

  const downloadAttachment = async (url: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('order-attachments')
        .download(url);

      if (error) throw error;

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'withdrawn': return 'bg-gray-500';
      default: return 'bg-gray-500';
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
        <h1 className="text-3xl font-bold">Bids Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bids available.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Writer</TableHead>
                  <TableHead>Price/Page</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Time Needed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-mono text-sm">
                      {bid.order_id.substring(0, 6)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium line-clamp-1">{bid.orders.title}</div>
                        <div className="text-sm text-muted-foreground">{bid.orders.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bid.profiles.full_name}</div>
                        <div className="text-sm text-muted-foreground">{bid.profiles.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${bid.price_per_page?.toFixed(2) || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${bid.proposed_rate?.toFixed(2) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {bid.time_needed_days}d {bid.time_needed_hours}h
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bid.status)}>
                        {bid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBid(bid);
                          setDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bid Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bid Details</SheetTitle>
          </SheetHeader>
          
          {selectedBid && (
            <div className="space-y-6 py-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Writer</p>
                <p className="font-medium">{selectedBid.profiles.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedBid.profiles.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Title</p>
                <p className="font-medium">{selectedBid.orders.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price per page</p>
                  <p className="font-semibold text-lg">${selectedBid.price_per_page?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total price</p>
                  <p className="font-semibold text-lg text-green-600">${selectedBid.proposed_rate?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Time needed</p>
                <p className="font-medium">{selectedBid.time_needed_days} days {selectedBid.time_needed_hours} hours</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Order deadline</p>
                <p className="font-medium">
                  {new Date(selectedBid.orders.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Academic Level</p>
                <p className="font-medium capitalize">{selectedBid.orders.academic_level?.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Pages/Words</p>
                <p className="font-medium">{selectedBid.orders.pages}p / {selectedBid.orders.words} words</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Referencing Style & Sources</p>
                <p className="font-medium">{selectedBid.orders.referencing_style || 'APA7'} - {selectedBid.orders.sources} sources</p>
              </div>

              {selectedBid.orders.attachments && selectedBid.orders.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Attachments</p>
                  <div className="space-y-2">
                    {selectedBid.orders.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => downloadAttachment(attachment, `attachment-${index + 1}`)}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Attachment {index + 1}
                        </span>
                        <Download className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Instructions</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedBid.orders.instructions || selectedBid.orders.description}
                  </p>
                </div>
              </div>

              {selectedBid.cover_letter && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Writer's Message</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBid.cover_letter}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={getStatusColor(selectedBid.status)}>
                  {selectedBid.status}
                </Badge>
              </div>

              {selectedBid.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleBidAction(selectedBid.id, 'accepted')}
                  >
                    Accept & Assign
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleBidAction(selectedBid.id, 'rejected')}
                  >
                    Reject Bid
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
