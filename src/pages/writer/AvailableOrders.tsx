import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  DollarSign,
  Clock,
  BookOpen,
  Search,
  Filter,
  Calendar,
  User,
} from "lucide-react";

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
  profiles: {
    full_name: string;
  };
}

export default function AvailableOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, categoryFilter, levelFilter]);

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
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(order => order.category === categoryFilter);
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter(order => order.academic_level === levelFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleExpressInterest = async (orderId: string) => {
    try {
      // This would typically create a bid or expression of interest
      toast({
        title: "Interest Expressed",
        description: "Your interest has been recorded. The client will be notified.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to express interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAcademicLevelColor = (level: string) => {
    switch (level) {
      case 'high_school': return 'bg-blue-100 text-blue-800';
      case 'undergraduate': return 'bg-green-100 text-green-800';
      case 'graduate': return 'bg-purple-100 text-purple-800';
      case 'phd': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(orders.map(order => order.category))];
    return categories.sort();
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
        <Badge variant="outline" className="text-lg px-3 py-1">
          {filteredOrders.length} Orders
        </Badge>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? "There are no available orders at the moment." 
                : "No orders match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{order.title}</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${order.budget_usd}</div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getAcademicLevelColor(order.academic_level)}>
                    {order.academic_level.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{order.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4 line-clamp-3">
                  {order.description}
                </CardDescription>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{order.words} words / {order.pages} pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDeadline(order.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.profiles.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant="writer"
                  onClick={() => handleExpressInterest(order.id)}
                >
                  Express Interest
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}