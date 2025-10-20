import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";

interface WriterStats {
  id: string;
  full_name: string;
  email: string;
  orders_assigned: number;
  completed_orders: number;
  active_orders: number;
  total_earned: number;
  amount_due: number;
  fines_imposed: number;
}

interface ClientStats {
  id: string;
  full_name: string;
  email: string;
  orders_posted: number;
  active_orders: number;
  completed_orders: number;
  total_spent: number;
  pending_payments: number;
  upcoming_deadlines: number;
}

export default function UserAnalytics() {
  const [writerStats, setWriterStats] = useState<WriterStats[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch writer statistics
      const { data: writers, error: writersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          assignments (
            id,
            status,
            orders (
              budget_usd,
              status
            )
          )
        `)
        .eq('role', 'writer');

      if (writersError) throw writersError;

      // Process writer data
      const processedWriters: WriterStats[] = writers.map((writer) => {
        const assignments = writer.assignments || [];
        const ordersAssigned = assignments.length;
        const completedOrders = assignments.filter(a => a.orders?.status === 'completed').length;
        const activeOrders = assignments.filter(a => a.status === 'active').length;
        
        // Calculate earnings (80% commission for writers)
        const totalEarned = assignments
          .filter(a => a.orders?.status === 'completed')
          .reduce((sum, a) => sum + (Number(a.orders?.budget_usd || 0) * 0.8), 0);
        
        // Amount due from active assignments
        const amountDue = assignments
          .filter(a => a.status === 'active')
          .reduce((sum, a) => sum + (Number(a.orders?.budget_usd || 0) * 0.8), 0);

        return {
          id: writer.id,
          full_name: writer.full_name,
          email: writer.email,
          orders_assigned: ordersAssigned,
          completed_orders: completedOrders,
          active_orders: activeOrders,
          total_earned: totalEarned,
          amount_due: amountDue,
          fines_imposed: 0, // Placeholder for fines
        };
      });

      setWriterStats(processedWriters);

      // Fetch client statistics
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          orders (
            id,
            status,
            budget_usd,
            deadline,
            invoices (
              status,
              amount_usd
            )
          )
        `)
        .eq('role', 'client');

      if (clientsError) throw clientsError;

      // Process client data
      const processedClients: ClientStats[] = clients.map((client) => {
        const orders = client.orders || [];
        const ordersPosted = orders.length;
        const activeOrders = orders.filter(o => ['available', 'in_progress'].includes(o.status)).length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        // Calculate total spent from paid invoices
        const totalSpent = orders.reduce((sum, order) => {
          const paidInvoices = order.invoices?.filter(inv => inv.status === 'paid') || [];
          return sum + paidInvoices.reduce((invSum, inv) => invSum + Number(inv.amount_usd), 0);
        }, 0);

        // Pending payments
        const pendingPayments = orders.reduce((sum, order) => {
          const unpaidInvoices = order.invoices?.filter(inv => inv.status === 'unpaid') || [];
          return sum + unpaidInvoices.reduce((invSum, inv) => invSum + Number(inv.amount_usd), 0);
        }, 0);

        // Upcoming deadlines (within 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingDeadlines = orders.filter(o => {
          const deadline = new Date(o.deadline);
          return deadline >= now && deadline <= sevenDaysFromNow && o.status !== 'completed';
        }).length;

        return {
          id: client.id,
          full_name: client.full_name,
          email: client.email,
          orders_posted: ordersPosted,
          active_orders: activeOrders,
          completed_orders: completedOrders,
          total_spent: totalSpent,
          pending_payments: pendingPayments,
          upcoming_deadlines: upcomingDeadlines,
        };
      });

      setClientStats(processedClients);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Analytics</h1>
          <p className="text-muted-foreground">Track writers and clients performance</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalWriters = writerStats.length;
  const totalClients = clientStats.length;
  const totalWriterEarnings = writerStats.reduce((sum, w) => sum + w.total_earned, 0);
  const totalClientSpent = clientStats.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Analytics</h1>
        <p className="text-muted-foreground">Track writers and clients performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Writers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWriters}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writer Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWriterEarnings)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalClientSpent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="writers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="writers">Writers</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="writers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Writer Performance</CardTitle>
              <CardDescription>
                Detailed statistics for all writers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Assigned</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead className="text-right">Fines</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writerStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No writers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    writerStats.map((writer) => (
                      <TableRow key={writer.id}>
                        <TableCell className="font-medium">{writer.full_name}</TableCell>
                        <TableCell>{writer.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{writer.orders_assigned}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{writer.active_orders}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{writer.completed_orders}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(writer.total_earned)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(writer.amount_due)}
                        </TableCell>
                        <TableCell className="text-right">
                          {writer.fines_imposed > 0 ? (
                            <span className="text-destructive">
                              {formatCurrency(writer.fines_imposed)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Activity</CardTitle>
              <CardDescription>
                Detailed statistics for all clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Posted</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-center">Upcoming</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No clients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientStats.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{client.orders_posted}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{client.active_orders}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{client.completed_orders}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(client.total_spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          {client.pending_payments > 0 ? (
                            <span className="text-orange-500">
                              {formatCurrency(client.pending_payments)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {client.upcoming_deadlines > 0 ? (
                            <Badge variant="destructive">{client.upcoming_deadlines}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
