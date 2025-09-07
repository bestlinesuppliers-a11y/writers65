import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { 
  FileText, 
  CreditCard, 
  Users, 
  CheckCircle, 
  Clock,
  MessageSquare,
  Shield,
  ArrowRight,
  DollarSign
} from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 gradient-hero animate-gradient">
        <div className="container text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            How 365writers Works
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            A simple, secure, and efficient process that connects students with professional writers
          </p>
        </div>
      </section>

      {/* Client Flow */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-client">For Students & Clients</h2>
            <p className="text-xl text-muted-foreground">Get professional academic writing help in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-client-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-client" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <CardTitle className="text-lg">Submit Your Order</CardTitle>
                <CardDescription>
                  Fill out our detailed order form with your project requirements, deadline, and academic level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Project type & subject</li>
                  <li>• Word count & pages</li>
                  <li>• Academic level</li>
                  <li>• Deadline & instructions</li>
                  <li>• Upload reference files</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-crypto-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-crypto" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <CardTitle className="text-lg">Secure Payment</CardTitle>
                <CardDescription>
                  Pay safely using USDT (TRC20) cryptocurrency to our secure wallet address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• USDT (TRC20) only</li>
                  <li>• QR code provided</li>
                  <li>• Instant confirmation</li>
                  <li>• Secure & anonymous</li>
                  <li>• No chargebacks</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-writer-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-writer" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <CardTitle className="text-lg">Writer Assignment</CardTitle>
                <CardDescription>
                  A qualified writer with expertise in your subject is assigned to your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Subject matter expert</li>
                  <li>• Verified credentials</li>
                  <li>• High ratings</li>
                  <li>• Direct communication</li>
                  <li>• Progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <CardTitle className="text-lg">Receive Your Work</CardTitle>
                <CardDescription>
                  Get your completed work on time with free revisions if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• On-time delivery</li>
                  <li>• Plagiarism-free</li>
                  <li>• Free revisions</li>
                  <li>• Quality guarantee</li>
                  <li>• 24/7 support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth/register?type=client">
              <Button variant="client" size="lg" className="text-lg px-8 py-4">
                Start Your Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Writer Flow */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-writer">For Professional Writers</h2>
            <p className="text-xl text-muted-foreground">Join our network and start earning with your writing skills</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-writer-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-writer" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <CardTitle className="text-lg">Apply & Verify</CardTitle>
                <CardDescription>
                  Submit your application with credentials, writing samples, and complete verification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Academic qualifications</li>
                  <li>• Writing samples</li>
                  <li>• ID verification</li>
                  <li>• Skills assessment</li>
                  <li>• Admin approval</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <CardTitle className="text-lg">Browse Orders</CardTitle>
                <CardDescription>
                  Access available orders matching your expertise and bid on projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Filter by subject</li>
                  <li>• Choose difficulty level</li>
                  <li>• View deadlines</li>
                  <li>• Check payment amounts</li>
                  <li>• Claim assignments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <CardTitle className="text-lg">Complete Work</CardTitle>
                <CardDescription>
                  Write high-quality content within deadlines and communicate with clients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Follow guidelines</li>
                  <li>• Original content</li>
                  <li>• Meet deadlines</li>
                  <li>• Client communication</li>
                  <li>• Submit drafts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 relative">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-secondary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <CardTitle className="text-lg">Get Paid</CardTitle>
                <CardDescription>
                  Receive payment for approved work through your preferred method.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Competitive rates</li>
                  <li>• Weekly payouts</li>
                  <li>• Multiple methods</li>
                  <li>• Performance bonuses</li>
                  <li>• Track earnings</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth/register?type=writer">
              <Button variant="writer" size="lg" className="text-lg px-8 py-4">
                Become a Writer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Process */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Secure USDT Payment Process</h2>
            <p className="text-xl text-muted-foreground">Fast, secure, and anonymous payments using cryptocurrency</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-strong border-0">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-crypto-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-10 w-10 text-crypto" />
                </div>
                <CardTitle className="text-2xl">USDT (TRC20) Payment</CardTitle>
                <CardDescription className="text-lg">
                  We accept USDT on the TRON network for fast and secure transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-crypto rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                      1
                    </div>
                    <h4 className="font-semibold mb-2">Copy Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy our USDT (TRC20) wallet address or scan the QR code
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-crypto rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                      2
                    </div>
                    <h4 className="font-semibold mb-2">Send Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Send the exact USDT amount from your wallet to our address
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-crypto rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                      3
                    </div>
                    <h4 className="font-semibold mb-2">Confirm Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "I've Paid" and our team will verify the transaction
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-secondary" />
                    Payment Security
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      All transactions are verified on the TRON blockchain
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      No personal financial information required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      Fast confirmation times (usually under 5 minutes)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      Work begins immediately after payment confirmation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Get answers to common questions about our platform</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">How long does it take to complete an order?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Delivery times depend on the length and complexity of your project. Most essays (1-5 pages) 
                  are completed within 24-48 hours. Longer projects may take 3-7 days. Rush orders are available 
                  for urgent deadlines.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">What subjects do you cover?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our writers specialize in a wide range of subjects including Business, Psychology, Literature, 
                  History, Science, Mathematics, Engineering, and more. We match your order with a writer who 
                  has expertise in your specific field.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">Is my personal information secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we prioritize your privacy and security. We use cryptocurrency payments to ensure anonymity, 
                  and all personal information is encrypted and stored securely. We never share your information 
                  with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">Can I communicate with my writer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! Our platform includes a secure messaging system that allows direct communication 
                  between clients and writers. You can ask questions, provide additional instructions, and track 
                  the progress of your order.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of satisfied clients and professional writers today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register?type=client">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Post Your Order
              </Button>
            </Link>
            <Link to="/auth/register?type=writer">
              <Button variant="writer" size="lg" className="text-lg px-8 py-4">
                Become a Writer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;