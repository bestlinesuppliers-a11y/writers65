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
import { Search, Download, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  status: string;
  sources: number;
  attachments: string[];
  instructions: string;
  profiles: {
    full_name: string;
  };
}

export default function AvailableOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [pricePerPageDollars, setPricePerPageDollars] = useState("");
  const [pricePerPageCents, setPricePerPageCents] = useState("");
  const [timeNeededDays, setTimeNeededDays] = useState("");
  const [timeNeededHours, setTimeNeededHours] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchAvailableOrders = async () => {
    try {
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
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available orders.",
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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleBidOrder = () => {
    setOrderDetailsOpen(false);
    setPricePerPageDollars("");
    setPricePerPageCents("");
    setTimeNeededDays("");
    setTimeNeededHours("");
    setBidMessage("");
    setBidDialogOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedOrder || !pricePerPageDollars || !timeNeededDays) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmittingBid(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const pricePerPage = parseFloat(pricePerPageDollars) + (parseFloat(pricePerPageCents || "0") / 100);
      const totalPrice = pricePerPage * selectedOrder.pages;

      const { error } = await supabase
        .from('bids')
        .insert({
          order_id: selectedOrder.id,
          writer_id: user.id,
          price_per_page: pricePerPage,
          proposed_rate: totalPrice,
          time_needed_days: parseInt(timeNeededDays),
          time_needed_hours: parseInt(timeNeededHours || "0"),
          cover_letter: bidMessage,
        });

      if (error) throw error;

      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully.",
      });

      setBidDialogOpen(false);
      setSelectedOrder(null);
      setPricePerPageDollars("");
      setPricePerPageCents("");
      setTimeNeededDays("");
      setTimeNeededHours("");
      setBidMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const downloadAttachment = async (url: string, filename: string) => {
    try {
      // Extract the actual file path from the full URL if it's a full URL
      const filePath = url.includes('order-attachments/') 
        ? url.split('order-attachments/')[1] 
        : url;

      const { data, error } = await supabase.storage
        .from('order-attachments')
        .download(filePath);

      if (error) throw error;

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download attachment",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Orders</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type of work</TableHead>
                  <TableHead>Spacing</TableHead>
                  <TableHead>Pages/Word count</TableHead>
                  <TableHead>Deadline / time left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const deadlineInfo = formatDeadline(order.deadline);
                  return (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOrderClick(order)}
                    >
                      <TableCell className="font-mono text-sm">
                        {order.id.substring(0, 6)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium line-clamp-1">{order.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {order.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatAcademicLevel(order.academic_level)}</Badge>
                      </TableCell>
                      <TableCell>{order.referencing_style || 'Double'}</TableCell>
                      <TableCell>
                        {order.pages}p/ {order.words} words
                      </TableCell>
                      <TableCell>
                        <div className={deadlineInfo.color}>
                          {new Date(order.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })} / {deadlineInfo.text}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Sheet */}
      <Sheet open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="space-y-6 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono">{selectedOrder.id.substring(0, 6)}</p>
                </div>
                <Badge>{selectedOrder.status}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Pages</p>
                <p className="font-medium">{selectedOrder.pages} Double spaced ({selectedOrder.words} words)</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Style and sources</p>
                <p className="font-medium">{selectedOrder.referencing_style || 'APA7'}, {selectedOrder.sources} source</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Study level</p>
                <p className="font-medium">{formatAcademicLevel(selectedOrder.academic_level)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Assignment type</p>
                <p className="font-medium">{selectedOrder.category}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selectedOrder.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                <p className="font-medium">
                  {new Date(selectedOrder.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Attachments</p>
                  <div className="space-y-2">
                    {selectedOrder.attachments.map((attachment, index) => (
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
                <p className="text-sm text-muted-foreground mb-2">Writing instructions</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedOrder.instructions || selectedOrder.description}</p>
                </div>
              </div>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                onClick={handleBidOrder}
              >
                Apply to work
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to work on order</DialogTitle>
            <DialogDescription>
              Let us know the time you need to finish the order and the price per page you expect. Support can assign you the order anytime unless you withdraw your bid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Price per page</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">US dollars</Label>
                  <Select value={pricePerPageDollars} onValueChange={setPricePerPageDollars}>
                    <SelectTrigger>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 51 }, (_, i) => i).map(i => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">US cents</Label>
                  <Select value={pricePerPageCents} onValueChange={setPricePerPageCents}>
                    <SelectTrigger>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {['00', '25', '50', '75'].map(cents => (
                        <SelectItem key={cents} value={cents}>{cents}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Time you need</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Days</Label>
                  <Select value={timeNeededDays} onValueChange={setTimeNeededDays}>
                    <SelectTrigger>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i).map(i => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hours</Label>
                  <Select value={timeNeededHours} onValueChange={setTimeNeededHours}>
                    <SelectTrigger>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map(i => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bidMessage">Message</Label>
              <Textarea
                id="bidMessage"
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                placeholder="I consider my bid reasonable because this order requires calculations / use of formulas / deep understanding of ... / skills in ... Thank you."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              onClick={handleSubmitBid} 
              disabled={submittingBid}
            >
              {submittingBid ? "Submitting..." : "Apply to work"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}