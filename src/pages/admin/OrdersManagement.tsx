import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, DollarSign, Calendar, User, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Order {
  id: string;
  title: string;
  category: string;
  budget_usd: number;
  status: string;
  deadline: string;
  academic_level: string;
  pages: number;
  words: number;
  created_at: string;
  attachments: string[];
  instructions: string;
  description: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:client_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: status as any } : order
      ));

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const downloadAttachment = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('order-attachments')
        .download(filePath);

      if (error) throw error;

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const profileFullName = order.profiles ? order.profiles.full_name : '';
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profileFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'secondary';
      case 'available': return 'outline';
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all orders on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            View and manage all orders placed by clients.
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{order.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-xs">
                            {order.category}
                          </Badge>
                          <span>{order.pages} pages</span>
                          <span>•</span>
                          <span>{order.words} words</span>
                          <span>•</span>
                          <span>{order.academic_level}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.profiles?.email || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${order.budget_usd}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {order.status === 'pending_payment' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'available')}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.substring(0, 6)}</DialogTitle>
            <DialogDescription>{selectedOrder?.title}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                 <div><span className="font-semibold">Category:</span> {selectedOrder.category}</div>
                 <div><span className="font-semibold">Academic Level:</span> {selectedOrder.academic_level}</div>
                 <div><span className="font-semibold">Pages:</span> {selectedOrder.pages}</div>
                 <div><span className="font-semibold">Words:</span> {selectedOrder.words}</div>
                 <div><span className="font-semibold">Budget:</span> ${selectedOrder.budget_usd}</div>
                 <div><span className="font-semibold">Deadline:</span> {new Date(selectedOrder.deadline).toLocaleString()}</div>
               </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedOrder.instructions || selectedOrder.description}</p>
                </div>
              </div>

              {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedOrder.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => downloadAttachment(attachment)}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {attachment.split('/').pop()}
                        </span>
                        <Download className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
