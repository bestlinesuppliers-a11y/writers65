import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  MessageSquare,
} from "lucide-react";

interface WriterStats {
  totalAssignments: number;
  activeOrders: number;
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  pendingSubmissions: number;
  unreadMessages: number;
}

export default function WriterDashboard() {
  const [stats, setStats] = useState<WriterStats>({
    totalAssignments: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingSubmissions: 0,
    unreadMessages: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [writerProfile, setWriterProfile] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch writer profile
      const { data: profile } = await supabase
        .from('writer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setWriterProfile(profile);

      // Fetch assignments stats
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          *,
          orders (
            id,
            title,
            budget_usd,
            deadline,
            status,
            client_id,
            profiles!orders_client_id_fkey (full_name)
          )
        `)
        .eq('writer_id', user.id)
        .order('created_at', { ascending: false });

      if (assignments) {
        const activeOrders = assignments.filter(a => a.status === 'active').length;
        const completedOrders = assignments.filter(a => a.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          totalAssignments: assignments.length,
          activeOrders,
          completedOrders,
        }));

        setRecentAssignments(assignments.slice(0, 5));
      }

      // Fetch submissions stats
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('writer_id', user.id);

      if (submissions) {
        const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
        setStats(prev => ({
          ...prev,
          pendingSubmissions,
        }));
      }

      // Fetch messages stats
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('is_read', false);

      if (messages) {
        setStats(prev => ({
          ...prev,
          unreadMessages: messages.length,
        }));
      }

      // Set profile-based stats
      if (profile) {
        setStats(prev => ({
          ...prev,
          totalEarnings: 0, // This would need to be calculated from completed payments
          averageRating: profile.rating || 0,
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending_payment': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'available': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getVerificationStatus = () => {
    if (!writerProfile) return { status: 'Unknown', color: 'bg-gray-500' };
    
    switch (writerProfile.verification_status) {
      case 'verified': return { status: 'Verified', color: 'bg-green-500' };
      case 'pending': return { status: 'Pending', color: 'bg-yellow-500' };
      case 'rejected': return { status: 'Rejected', color: 'bg-red-500' };
      default: return { status: 'Not Submitted', color: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Writer Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge className={verificationStatus.color}>
            {verificationStatus.status}
          </Badge>
          {writerProfile?.availability && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Available for Work
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foregreen">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Submissions
            </CardTitle>
            <CardDescription>
              You have {stats.pendingSubmissions} submission(s) awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/writer/submissions">
              <Button className="w-full">View Submissions</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Unread Messages
            </CardTitle>
            <CardDescription>
              You have {stats.unreadMessages} unread message(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/writer/messages">
              <Button className="w-full" variant="outline">View Messages</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Available Orders
            </CardTitle>
            <CardDescription>
              Browse new orders matching your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/writer/orders">
              <Button className="w-full" variant="writer">Browse Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>Your latest assigned orders</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments yet</p>
              <p className="text-sm">Start by browsing available orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{assignment.orders?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Client: {assignment.orders?.profiles?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deadline: {new Date(assignment.due_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    <span className="font-semibold text-green-600">
                      ${assignment.orders?.budget_usd}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}