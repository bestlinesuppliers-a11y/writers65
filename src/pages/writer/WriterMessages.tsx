import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Send, MessageCircle, Search, Clock, User, Upload, Paperclip } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  order_id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  read_at: string;
  attachments: string[];
  orders: {
    title: string;
    client_id: string;
  };
  from_profile: {
    full_name: string;
    role: string;
  };
}

export default function WriterMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          orders (title, client_id),
          from_profile:profiles!messages_from_user_id_fkey (full_name, role)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const uploadAttachments = async (userId: string): Promise<string[]> => {
    const uploadedPaths: string[] = [];

    for (const file of attachments) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      uploadedPaths.push(fileName);
    }

    return uploadedPaths;
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let attachmentPaths: string[] = [];
      
      if (attachments.length > 0) {
        attachmentPaths = await uploadAttachments(user.id);
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          order_id: selectedMessage.order_id,
          from_user_id: user.id,
          to_user_id: selectedMessage.from_user_id,
          subject: `Re: ${selectedMessage.subject}`,
          body: replyText,
          attachments: attachmentPaths,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      setReplyText("");
      setAttachments([]);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const downloadAttachment = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("message-attachments")
      .download(path);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.split("/").pop() || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.from_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
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
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with clients about your assignments
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`cursor-pointer transition-colors ${
                selectedMessage?.id === message.id ? 'border-primary' : ''
              } ${!message.is_read ? 'bg-blue-50' : ''}`}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.is_read) {
                  markAsRead(message.id);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {message.subject || 'No Subject'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      From: {message.from_profile?.full_name} • 
                      Order: {message.orders?.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!message.is_read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {message.body}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(message.created_at), "PPp")}
                </p>
              </CardContent>
            </Card>
          ))}

          {filteredMessages.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No messages to display.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Detail & Reply */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {selectedMessage.subject || 'No Subject'}
                </CardTitle>
                <CardDescription>
                  From: {selectedMessage.from_profile?.full_name} • 
                  {format(new Date(selectedMessage.created_at), "PPp")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Message:</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                </div>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadAttachment(attachment)}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {attachment.split('/').pop()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium mb-2">Reply:</h4>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                  />

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Attach Files
                        </label>
                      </Button>
                    </label>
                    {attachments.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {attachments.length} file(s) selected
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={sendReply} 
                    className="w-full"
                    disabled={!replyText.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a message</h3>
                <p className="text-muted-foreground">
                  Choose a message from the list to view and reply.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}