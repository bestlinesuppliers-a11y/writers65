import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Calendar, Download, Eye, Clock } from "lucide-react";
import { format } from "date-fns";

interface Earning {
  id: string;
  order_id: string;
  amount_usd: number;
  status: string;
  created_at: string;
  paid_at: string;
  orders: {
    title: string;
    completed_at: string;
    budget_usd: number;
    profiles: {
      full_name: string;
    };
  };
}

interface EarningsStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  thisMonthEarnings: number;
  completedOrders: number;
  averageOrderValue: number;
}

export default function WriterEarnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    thisMonthEarnings: 0,
    completedOrders: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch earnings from completed orders
      const { data: completedOrders, error: ordersError } = await supabase
        .from('assignments')
        .select(`
          id,
          order_id,
          orders (
            id,
            title,
            budget_usd,
            completed_at,
            client_id,
            profiles (full_name)
          )
        `)
        .eq('writer_id', user.id)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Calculate earnings (assuming 80% commission for writers)
      const earningsData: Earning[] = (completedOrders || []).map(assignment => ({
        id: assignment.id,
        order_id: assignment.order_id,
        amount_usd: Number(assignment.orders?.budget_usd || 0) * 0.8, // 80% commission
        status: 'paid', // Simplified - in real app, track payment status
        created_at: assignment.orders?.completed_at || '',
        paid_at: assignment.orders?.completed_at || '',
        orders: assignment.orders,
      }));

      setEarnings(earningsData);

      // Calculate statistics
      const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount_usd, 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthEarnings = earningsData
        .filter(earning => {
          const earningDate = new Date(earning.created_at);
          return earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear;
        })
        .reduce((sum, earning) => sum + earning.amount_usd, 0);

      const completedCount = earningsData.length;
      const averageOrderValue = completedCount > 0 ? totalEarnings / completedCount : 0;

      setStats({
        totalEarnings,
        pendingEarnings: 0, // Simplified
        paidEarnings: totalEarnings,
        thisMonthEarnings,
        completedOrders: completedCount,
        averageOrderValue,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEarnings = earnings.filter(earning => {
    if (selectedPeriod === 'all') return true;
    
    const earningDate = new Date(earning.created_at);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'month':
        return earningDate.getMonth() === now.getMonth() && earningDate.getFullYear() === now.getFullYear();
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const earningQuarter = Math.floor(earningDate.getMonth() / 3);
        return earningQuarter === currentQuarter && earningDate.getFullYear() === now.getFullYear();
      case 'year':
        return earningDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          Track your income and payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonthEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {(['all', 'month', 'quarter', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'all' ? 'All Time' : 
               period === 'month' ? 'This Month' :
               period === 'quarter' ? 'This Quarter' : 'This Year'}
            </Button>
          ))}
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Earnings List */}
      <div className="space-y-4">
        {filteredEarnings.map((earning) => (
          <Card key={earning.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {earning.orders?.title}
                  </CardTitle>
                  <CardDescription>
                    Client: {earning.orders?.profiles?.full_name}
                    <br />
                    Completed: {format(new Date(earning.created_at), "PPP")}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${earning.amount_usd.toFixed(2)}
                  </div>
                  <Badge className={getStatusColor(earning.status)}>
                    {earning.status === 'paid' ? <Eye className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                    {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Order Budget: ${earning.orders?.budget_usd}</span>
                <span>Commission Rate: 80%</span>
                {earning.paid_at && (
                  <span>Paid: {format(new Date(earning.paid_at), "PP")}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEarnings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No earnings found</h3>
            <p className="text-muted-foreground">
              Complete orders to start earning money.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}