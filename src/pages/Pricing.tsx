import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { 
  Calculator,
  Clock,
  Shield,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  duration: string;
  pricePerPage: number;
  popular?: boolean;
  features: string[];
  urgency: 'standard' | 'express' | 'urgent' | 'rush';
}

const pricingTiers: PricingTier[] = [
  {
    id: '1month',
    name: 'Standard',
    duration: '1 Month',
    pricePerPage: 6,
    urgency: 'standard',
    features: [
      'High quality writing',
      'Unlimited revisions',
      'Plagiarism report',
      '24/7 support',
      'Money-back guarantee'
    ]
  },
  {
    id: '14days',
    name: 'Premium',
    duration: '14 Days',
    pricePerPage: 8,
    popular: true,
    urgency: 'standard',
    features: [
      'All Standard features',
      'Priority support',
      'Advanced writer selection',
      'Progress tracking',
      'Quality assurance check'
    ]
  },
  {
    id: '7days',
    name: 'Express',
    duration: '7 Days',
    pricePerPage: 10,
    urgency: 'express',
    features: [
      'All Premium features',
      'Expedited processing',
      'Senior writers only',
      'Direct communication',
      'Quality guarantee'
    ]
  },
  {
    id: '3days',
    name: 'Urgent',
    duration: '3 Days',
    pricePerPage: 13,
    urgency: 'urgent',
    features: [
      'All Express features',
      'Top-tier writers',
      'Urgent processing',
      'Live chat support',
      'Same-day start'
    ]
  },
  {
    id: '2days',
    name: 'Rush',
    duration: '2 Days',
    pricePerPage: 15,
    urgency: 'rush',
    features: [
      'All Urgent features',
      'Expert writers only',
      'Immediate assignment',
      'Hourly updates',
      'Premium quality check'
    ]
  },
  {
    id: '24hours',
    name: 'Super Rush',
    duration: '24 Hours',
    pricePerPage: 18,
    urgency: 'rush',
    features: [
      'All Rush features',
      'Master-level writers',
      'Instant processing',
      'Dedicated support',
      'Final quality review'
    ]
  },
  {
    id: '12hours',
    name: 'Ultra Rush',
    duration: '12 Hours',
    pricePerPage: 20,
    urgency: 'rush',
    features: [
      'All Super Rush features',
      'PhD-level writers only',
      'Priority queue',
      'Executive support',
      'Guaranteed delivery'
    ]
  }
];

const Pricing = () => {
  const [selectedPages, setSelectedPages] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<string>('14days');

  const selectedTierData = pricingTiers.find(tier => tier.id === selectedTier);
  const totalPrice = selectedPages * (selectedTierData?.pricePerPage || 0);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'standard': return 'text-secondary';
      case 'express': return 'text-accent';
      case 'urgent': return 'text-primary';
      case 'rush': return 'text-writer';
      default: return 'text-foreground';
    }
  };

  const getUrgencyBg = (urgency: string) => {
    switch (urgency) {
      case 'standard': return 'bg-secondary-light';
      case 'express': return 'bg-accent-light';
      case 'urgent': return 'bg-primary-light';
      case 'rush': return 'bg-writer-light';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 gradient-hero animate-gradient">
        <div className="container text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Transparent USDT Pricing
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose the perfect deadline for your project. Pay securely with USDT (TRC20) cryptocurrency.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Secure USDT Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-16 bg-background">
        <div className="container">
          <Card className="max-w-md mx-auto shadow-strong border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-crypto-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-crypto" />
              </div>
              <CardTitle className="text-2xl">Price Calculator</CardTitle>
              <CardDescription>
                Get an instant quote for your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pages">Number of Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  max="100"
                  value={selectedPages}
                  onChange={(e) => setSelectedPages(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center text-lg font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.duration} - {tier.pricePerPage} USDT/page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-crypto mb-2">
                  {totalPrice} USDT
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPages} page(s) × {selectedTierData?.pricePerPage} USDT
                </p>
              </div>
              
              <Link to="/auth/register?type=client">
                <Button className="w-full" size="lg" variant="crypto">
                  Order Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Deadline</h2>
            <p className="text-xl text-muted-foreground">
              Faster delivery means higher prices. All payments in USDT (TRC20).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`relative shadow-soft border-0 hover:shadow-medium transition-all duration-300 ${
                  tier.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${getUrgencyBg(tier.urgency)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Clock className={`h-8 w-8 ${getUrgencyColor(tier.urgency)}`} />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="text-lg font-medium">
                    {tier.duration}
                  </CardDescription>
                  <div className="text-3xl font-bold text-crypto">
                    {tier.pricePerPage} USDT
                  </div>
                  <p className="text-sm text-muted-foreground">per page</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth/register?type=client">
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      Select {tier.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Info */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why USDT Payments?</h2>
              <p className="text-xl text-muted-foreground">
                Fast, secure, and globally accessible cryptocurrency payments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-soft border-0 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-crypto-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-crypto" />
                  </div>
                  <CardTitle>Instant Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    USDT on TRON network ensures fast transaction confirmations, typically within minutes.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-crypto-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-crypto" />
                  </div>
                  <CardTitle>Anonymous & Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No personal banking details required. All transactions are secured by blockchain technology.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-crypto-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-6 w-6 text-crypto" />
                  </div>
                  <CardTitle>Low Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    TRON network offers minimal transaction fees, saving you money on every payment.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-crypto" />
                Payment Address
              </h3>
              <p className="text-sm mb-3">
                All payments should be sent to our secure USDT (TRC20) address:
              </p>
              <div className="bg-background p-3 rounded border font-mono text-sm break-all">
                TZDnBFWrQEzPuejZvYcQk9uegXWRT3fHd4
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Important: Send USDT (TRC20) only. Other networks may result in loss of funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Place Your Order?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Get started with professional academic writing today
          </p>
          <Link to="/auth/register?type=client">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Your Order
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;