import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Eye, Lock, User, Settings } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Button variant="outline" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At 365writers, we take privacy seriously. This policy explains how we collect, use, and protect personal data.
          </p>
        </div>

        {/* Information We Collect */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Eye className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Information We Collect</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start">
                <User className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Personal Information</p>
                  <p>Name, email, and contact information when you sign up.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Settings className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Payment Details</p>
                  <p>Payment information processed securely through trusted third-party providers.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Lock className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Order Information</p>
                  <p>Order details necessary to complete writing tasks and provide our services.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Settings className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">How We Use Information</h2>
            </div>
            
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>To provide writing services and process payments securely.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>To communicate with clients and writers regarding orders and service updates.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>To improve our services and ensure quality standards are maintained.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Data Protection</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-600">🔒 No Data Sharing</h3>
                <p className="text-muted-foreground">We do not sell, rent, or share personal data with third parties.</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-600">🛡️ Secure Storage</h3>
                <p className="text-muted-foreground">All information is stored securely and used only for service-related purposes.</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-600">👥 Restricted Access</h3>
                <p className="text-muted-foreground">Access to sensitive information is restricted to authorized staff only.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <User className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">User Rights</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Data Control</h3>
                <p className="text-muted-foreground">Clients and writers can request corrections or deletion of their personal data.</p>
              </div>
              
              <div className="p-4 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Communication Preferences</h3>
                <p className="text-muted-foreground">Users may opt out of marketing communications at any time.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Policy Reference */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Complete 365writers Policies</h2>
            <p className="text-muted-foreground mb-6">
              This privacy policy is part of our comprehensive terms and policies. For complete information about our policies for writers, clients, and general terms & conditions, please review our full policy document.
            </p>
            
            <div className="p-6 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold mb-4">365writers Complete Policy & Terms</h3>
              <p className="text-muted-foreground mb-4">
                At 365writers, we are committed to delivering quality writing services while ensuring fairness, professionalism, and confidentiality for both our writers and clients.
              </p>
              <Button asChild>
                <Link to="/legal/terms">
                  View Complete Terms & Policies
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Privacy Questions?</h3>
            <p className="text-muted-foreground mb-4">
              For any questions about this privacy policy or how we handle your data, please contact us:
            </p>
            <a 
              href="mailto:info365writers@gmail.com" 
              className="text-lg font-semibold text-primary hover:underline"
            >
              info365writers@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;