import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, CreditCard, Wallet, DollarSign, ArrowLeft } from "lucide-react";

interface Order {
  id: string;
  title: string;
  budget_usd: number;
  status: string;
}

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, title, budget_usd, status')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      navigate('/client/orders');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Payment details copied to clipboard",
    });
  };

  const handlePaymentSubmission = async () => {
    if (!selectedMethod || !transactionId) {
      toast({
        title: "Error",
        description: "Please select a payment method and enter transaction details",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create invoice record
      const { error } = await supabase
        .from('invoices')
        .insert({
          order_id: orderId,
          client_id: (await supabase.auth.getUser()).data.user?.id,
          amount_usd: order?.budget_usd,
          currency: selectedMethod === 'usdt' ? 'USDT-TRC20' : selectedMethod.toUpperCase(),
          tx_hash: transactionId,
          status: 'pending',
        });

      if (error) throw error;

      // Update order status  
      await supabase
        .from('orders')
        .update({ status: 'available' })
        .eq('id', orderId);

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification. You will be notified once confirmed.",
      });

      navigate('/client/orders');
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to submit payment details",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  const paymentMethods = [
    {
      id: 'payoneer',
      name: 'Payoneer',
      icon: CreditCard,
      details: 'info365writers@gmail.com',
      description: 'Send payment to our Payoneer account'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      details: 'info365writers@gmail.com',
      description: 'Send payment to our PayPal account'
    },
    {
      id: 'usdt',
      name: 'USDT (TRC20)',
      icon: Wallet,
      details: 'TZDnBFWrQEzPuejZvYcQk9uegXWRT3fHd4',
      description: 'Send USDT on TRON network only'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/client/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground">
            Choose your preferred payment method for order: {order.title}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Order ID:</span>
              <p className="font-mono">{order.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount Due:</span>
              <p className="text-2xl font-bold text-primary">${order.budget_usd}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMethod === method.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <method.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{method.name}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm break-all">{method.details}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(method.details);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {method.id === 'usdt' && (
                <p className="text-xs text-red-600">
                  ⚠️ Important: Send USDT (TRC20) only. Other networks may result in loss of funds.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Confirmation */}
      {selectedMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Confirmation</CardTitle>
            <CardDescription>
              After sending payment via {paymentMethods.find(m => m.id === selectedMethod)?.name}, 
              please provide the transaction details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transactionId">
                Transaction ID / Reference Number *
              </Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID, hash, or reference number"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This helps us verify your payment quickly
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedMethod("")}
              >
                Change Method
              </Button>
              <Button 
                onClick={handlePaymentSubmission}
                className="flex-1"
                disabled={!transactionId}
              >
                Submit Payment Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <p>Send the exact amount (${order.budget_usd}) to the selected payment method</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <p>Copy the transaction ID/reference number from your payment confirmation</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <p>Submit the details above and we'll verify your payment within 24 hours</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">4</span>
            </div>
            <p>Once verified, your order will be made available to our writers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}