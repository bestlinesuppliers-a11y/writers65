import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, Paperclip, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  order_id: string;
  from_user_id: string;
  to_user_id: string | null;
  subject: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
  attachments: string[];
  order: {
    title: string;
    id: string;
  };
  sender: {
    full_name: string;
    email: string;
  };
  recipient: {
    full_name: string;
    email: string;
  } | null;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        order:orders(title, id),
        sender:profiles!messages_from_user_id_fkey(full_name, email),
        recipient:profiles!messages_to_user_id_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", messageId);

    if (!error) {
      setMessages(messages.map(m => m.id === messageId ? { ...m, is_read: true } : m));
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
    if (!selectedMessage || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      let attachmentPaths: string[] = [];
      
      if (attachments.length > 0) {
        attachmentPaths = await uploadAttachments(user.id);
      }

      const { error } = await supabase.from("messages").insert({
        order_id: selectedMessage.order_id,
        from_user_id: user.id,
        to_user_id: selectedMessage.from_user_id,
        subject: `Re: ${selectedMessage.subject || "No Subject"}`,
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
      console.error("Error sending reply:", error);
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

  const filteredMessages = messages.filter(
    (msg) =>
      msg.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-96 col-span-1" />
          <Skeleton className="h-96 col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages found
              </p>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted hover:bg-muted/80"
                  } ${!message.is_read ? "border-l-4 border-l-primary" : ""}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.is_read) markAsRead(message.id);
                  }}
                >
                  <p className="font-semibold text-sm">
                    {message.subject || "No Subject"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From: {message.sender.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order: {message.order.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedMessage ? "Message Details" : "Select a message"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMessage ? (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      {selectedMessage.subject || "No Subject"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      From: {selectedMessage.sender.full_name} ({selectedMessage.sender.email})
                    </p>
                    {selectedMessage.recipient && (
                      <p className="text-sm text-muted-foreground">
                        To: {selectedMessage.recipient.full_name} ({selectedMessage.recipient.email})
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Order: {selectedMessage.order.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Attachments:</p>
                      {selectedMessage.attachments.map((path, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAttachment(path)}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {path.split("/").pop()}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold">Reply</h4>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
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

                  <Button onClick={sendReply} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Select a message to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
