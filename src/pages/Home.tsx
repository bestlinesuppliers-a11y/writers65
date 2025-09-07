import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { LiveStats } from "@/components/LiveStats";
import { 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Globe,
  Award
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero animate-gradient py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Professional Academic
              <span className="block text-transparent bg-gradient-to-r from-white to-blue-200 bg-clip-text">
                Writing Services
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect with expert writers for essays, research papers, and academic projects. 
              Fast, reliable, and secure payments with USDT.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register?type=client">
                <Button size="lg" variant="hero" className="text-lg px-8 py-4 shadow-glow">
                  Post an Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/register?type=writer">
                <Button size="lg" variant="writer" className="text-lg px-8 py-4 shadow-glow">
                  Become a Writer
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LiveStats />

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Choose 365writers?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A secure, efficient platform connecting students with professional academic writers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  USDT (TRC20) cryptocurrency payments for fast, secure, and anonymous transactions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-writer-light rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-writer" />
                </div>
                <CardTitle>Verified Writers</CardTitle>
                <CardDescription>
                  All writers are vetted professionals with proven academic writing experience and qualifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Fast Delivery</CardTitle>
                <CardDescription>
                  Get your completed work within deadlines, with rush orders available for urgent projects.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Quality Guarantee</CardTitle>
                <CardDescription>
                  Free revisions and quality assurance to ensure your work meets academic standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-client-light rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-client" />
                </div>
                <CardTitle>Global Network</CardTitle>
                <CardDescription>
                  Access writers from around the world, specializing in various academic disciplines and subjects.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-crypto-light rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-crypto" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Round-the-clock customer support and real-time messaging between clients and writers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and efficient process for both clients and writers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For Clients */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-client">For Clients</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold mb-2">Post Your Order</h4>
                    <p className="text-muted-foreground">Submit your project details, requirements, and deadline.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold mb-2">Make Payment</h4>
                    <p className="text-muted-foreground">Secure payment with USDT (TRC20) to our wallet address.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold mb-2">Writer Assignment</h4>
                    <p className="text-muted-foreground">A qualified writer is assigned to your project.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-client rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold mb-2">Receive Your Work</h4>
                    <p className="text-muted-foreground">Get your completed work on time with revision options.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Writers */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-writer">For Writers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold mb-2">Apply & Get Verified</h4>
                    <p className="text-muted-foreground">Submit your credentials and writing samples for approval.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold mb-2">Browse Orders</h4>
                    <p className="text-muted-foreground">View available projects matching your expertise.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold mb-2">Complete Work</h4>
                    <p className="text-muted-foreground">Write and submit high-quality work within deadlines.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-writer rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold mb-2">Get Paid</h4>
                    <p className="text-muted-foreground">Receive payment for approved work to your preferred method.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients and professional writers on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register?type=client">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Post Your First Order
              </Button>
            </Link>
            <Link to="/auth/register?type=writer">
              <Button size="lg" variant="writer" className="text-lg px-8 py-4">
                Start Writing Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="text-xl font-bold">365writers</span>
              </div>
              <p className="text-background/70">
                Professional academic writing services with secure USDT payments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-background/70">
                <li><Link to="/how-it-works" className="hover:text-background">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-background">Pricing</Link></li>
                <li><Link to="/auth/register?type=client" className="hover:text-background">Post Order</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Writers</h3>
              <ul className="space-y-2 text-background/70">
                <li><Link to="/auth/register?type=writer" className="hover:text-background">Become Writer</Link></li>
                <li><Link to="/writer/requirements" className="hover:text-background">Requirements</Link></li>
                <li><Link to="/writer/earnings" className="hover:text-background">Earnings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-background/70">
                <li><Link to="/contact" className="hover:text-background">Contact Us</Link></li>
                <li><Link to="/legal/terms" className="hover:text-background">Terms</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-background">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2025 365writers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;