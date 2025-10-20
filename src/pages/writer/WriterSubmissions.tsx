import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  order_id: string;
  message: string;
  status: string;
  version: number;
  files: string[];
  feedback: string;
  submitted_at: string;
  reviewed_at: string;
  is_final: boolean;
  orders: {
    title: string;
    client_id: string;
    profiles: {
      full_name: string;
    };
  };
}

export default function WriterSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          orders (
            title,
            client_id,
            profiles (full_name)
          )
        `)
        .eq('writer_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .download(filePath);

      if (error) throw error;

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error("Download error: ", error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !submissionMessage) {
      toast({
        title: "Error",
        description: "Please select an order and add a submission message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload files if any
      const uploadedFiles: string[] = [];
      for (const file of files) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(fileName, file);

        if (!uploadError) {
          uploadedFiles.push(fileName);
        }
      }

      const { error } = await supabase
        .from('submissions')
        .insert({
          order_id: selectedOrder,
          writer_id: user.id,
          message: submissionMessage,
          files: uploadedFiles,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission uploaded successfully",
      });

      setSelectedOrder("");
      setSubmissionMessage("");
      setFiles([]);
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit work",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'revision_required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          Submit completed work and track review status
        </p>
      </div>

      {/* New Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Work</CardTitle>
          <CardDescription>
            Upload your completed assignment for client review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="order">Select Order</Label>
            <select
              id="order"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an order...</option>
              {/* You would need to fetch active assignments here */}
            </select>
          </div>
          
          <div>
            <Label htmlFor="message">Submission Message</Label>
            <Textarea
              id="message"
              value={submissionMessage}
              onChange={(e) => setSubmissionMessage(e.target.value)}
              placeholder="Add notes about your submission..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="files">Upload Files</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Submit Work
          </Button>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid gap-6">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {submission.orders?.title}
                  </CardTitle>
                  <CardDescription>
                    Client: {submission.orders?.profiles?.full_name}
                    <br />
                    Version {submission.version} • 
                    Submitted {format(new Date(submission.submitted_at), "PPP")}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(submission.status)}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Submission Message:</h4>
                <p className="text-sm text-muted-foreground">{submission.message}</p>
              </div>

              {submission.feedback && (
                <div>
                  <h4 className="font-medium mb-2">Client Feedback:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {submission.feedback}
                  </p>
                </div>
              )}

              {submission.files && submission.files.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Files:</h4>
                  <div className="flex flex-wrap gap-2">
                    {submission.files.map((file, index) => (
                      <Button key={index} variant="outline" size="sm" onClick={() => downloadAttachment(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        {file.split('/').pop()}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {submission.is_final && (
                <Badge variant="secondary">Final Submission</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {submissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">
              Complete your assignments and submit them for review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
