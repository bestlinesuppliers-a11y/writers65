import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, CheckCircle, XCircle, Eye, Star, DollarSign } from "lucide-react";

interface WriterProfile {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  categories: string[];
  hourly_rate: number | null;
  per_page_rate: number | null;
  rating: number;
  completed_orders: number;
  verification_status: string;
  availability: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export default function WritersManagement() {
  const [writers, setWriters] = useState<WriterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchWriters();
  }, []);

  const fetchWriters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('writer_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWriters(data || []);
    } catch (error) {
      console.error('Error fetching writers:', error);
      toast({
        title: "Error",
        description: "Failed to load writers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (writerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('writer_profiles')
        .update({ verification_status: status })
        .eq('id', writerId);

      if (error) throw error;

      setWriters(writers.map(writer => 
        writer.id === writerId ? { ...writer, verification_status: status } : writer
      ));

      toast({
        title: "Success",
        description: `Writer ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update writer status",
        variant: "destructive",
      });
    }
  };

  const filteredWriters = writers.filter(writer => {
    const matchesSearch = writer.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         writer.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         writer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || writer.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
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
        <h1 className="text-3xl font-bold">Writers Management</h1>
        <p className="text-muted-foreground">
          Verify and manage writer profiles on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Writers ({filteredWriters.length})</CardTitle>
          <CardDescription>
            Review writer applications and manage their verification status.
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search writers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Writer</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Rates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWriters.map((writer) => (
                  <TableRow key={writer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{writer.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{writer.profiles.email}</p>
                        {writer.bio && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {writer.bio}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {writer.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {writer.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{writer.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{writer.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {writer.hourly_rate && (
                          <p className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${writer.hourly_rate}/hr
                          </p>
                        )}
                        {writer.per_page_rate && (
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            ${writer.per_page_rate}/page
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(writer.verification_status)}>
                        {writer.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{writer.completed_orders}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {writer.verification_status === 'pending' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Writer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve {writer.profiles.full_name}? 
                                    They will be able to accept orders on the platform.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => updateVerificationStatus(writer.id, 'verified')}
                                  >
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Writer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject {writer.profiles.full_name}? 
                                    They will not be able to accept orders on the platform.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => updateVerificationStatus(writer.id, 'rejected')}
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        
                        {writer.verification_status === 'rejected' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateVerificationStatus(writer.id, 'verified')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}