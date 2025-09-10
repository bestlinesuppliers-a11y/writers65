import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, User, FileText, MessageSquare, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  title: string;
  description: string;
  category: string;
  academic_level: string;
  words: number;
  pages: number;
  deadline: string;
  budget_usd: number;
  status: string;
  created_at: string;
  assigned_at: string;
  assignments: Array<{
    writer_id: string;
    status: string;
    assigned_at: string;
    profiles: {
      full_name: string;
    };
  }> | null;
  messages: Array<{
    id: string;
    is_read: boolean;
  }>;
  submissions: Array<{
    id: string;
    status: string;
    submitted_at: string;
  }>;
}

export default function ActiveOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_payment' | 'available' | 'assigned' | 'in_progress'>('all');

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          assignments (
            writer_id,
            status,
            assigned_at,
            profiles (full_name)
          ),
          messages (id, is_read),
          submissions (id, status, submitted_at)
        `)
        .eq('client_id', user.id)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment': return <Clock className="h-4 w-4" />;
      case 'available': return <Eye className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUnreadMessagesCount = (messages: any[]) => {
    return messages.filter(msg => !msg.is_read).length;
  };

  const getPendingSubmissions = (submissions: any[]) => {
    return submissions.filter(sub => sub.status === 'pending').length;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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
          <h1 className="text-3xl font-bold">Active Orders</h1>
          <p className="text-muted-foreground">
            Track the progress of your ongoing projects
          </p>
        </div>
        <Button onClick={() => navigate('/client/place-order')}>
          Place New Order
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending_payment', label: 'Pending Payment' },
          { key: 'available', label: 'Available' },
          { key: 'assigned', label: 'Assigned' },
          { key: 'in_progress', label: 'In Progress' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.title}</CardTitle>
                  <CardDescription>
                    {order.category} • {order.academic_level.replace('_', ' ')} • 
                    {order.words} words ({order.pages} pages)
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {order.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Deadline: {format(new Date(order.deadline), "MMM dd, yyyy")}
                    <span className={`ml-1 ${getDaysUntilDeadline(order.deadline) <= 3 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      ({getDaysUntilDeadline(order.deadline)} days)
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Writer: {order.assignments?.[0]?.profiles?.full_name || 'Not assigned'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Messages ({getUnreadMessagesCount(order.messages)} unread)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Submissions ({getPendingSubmissions(order.submissions)} pending)
                  </span>
                </div>
              </div>

              {order.assignments?.[0] && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium text-sm">Writer Assigned:</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.assignments[0].profiles.full_name} • 
                    Assigned {format(new Date(order.assignments[0].assigned_at), "PPp")}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-lg font-semibold text-primary">
                  ${order.budget_usd}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {order.status === 'pending_payment' && (
                    <Button size="sm">
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active orders found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "You don't have any active orders at the moment." 
                : `No orders with status "${filter.replace('_', ' ')}" found.`}
            </p>
            <Button onClick={() => navigate('/client/place-order')}>
              Place Your First Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}