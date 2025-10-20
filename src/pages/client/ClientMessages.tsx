import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Send, Search, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

interface Order {
  id: string;
  title: string;
}

export default function ClientMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [subject, setSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchMessages();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("id, title")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        order:orders(title, id),
        sender:profiles!messages_from_user_id_fkey(full_name, email)
      `)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
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

  const sendMessage = async () => {
    if (!selectedOrderId || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please select an order and enter a message",
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
        order_id: selectedOrderId,
        from_user_id: user.id,
        to_user_id: null, // Message to admin
        subject: subject || null,
        body: replyText,
        attachments: attachmentPaths,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setReplyText("");
      setSubject("");
      setAttachments([]);
      setSelectedOrderId("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
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
      msg.order.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold">Messages</h1>
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

        {/* Message Detail / Compose */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedMessage ? "Message Details" : "New Message"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMessage ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    {selectedMessage.subject || "No Subject"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From: {selectedMessage.sender.full_name} ({selectedMessage.sender.email})
                  </p>
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
            ) : (
              <div className="space-y-4">
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <Textarea
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
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

                <Button onClick={sendMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
