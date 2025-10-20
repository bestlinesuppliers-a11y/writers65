import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Mail, Shield, Users, FileText } from "lucide-react";

const Terms = () => {
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
            365writers Policy & Terms
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At 365writers, we are committed to delivering quality writing services while ensuring 
            fairness, professionalism, and confidentiality for both our writers and clients.
          </p>
          <p className="text-muted-foreground mt-4">
            All users of our platform are required to read and agree to the following policies, terms, and privacy practices.
          </p>
        </div>

        {/* Writer Policies */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-writer mr-3" />
              <h2 className="text-2xl font-bold">1. Policies for Writers</h2>
            </div>
            
            {/* Writer Responsibilities */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold">Writer Responsibilities</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-7">
                <li>• Submit only original, plagiarism-free, and high-quality work.</li>
                <li>• Deliver all assignments within the agreed deadline.</li>
                <li>• Follow client instructions carefully (format, referencing style, tone, etc.).</li>
                <li>• Handle revision requests promptly if they align with the original instructions.</li>
                <li>• Maintain professionalism and respectful communication at all times.</li>
              </ul>
            </div>

            {/* Prohibited Actions */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-xl font-semibold">Prohibited Actions</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-7">
                <li>• Submitting plagiarized or AI-generated work without disclosure.</li>
                <li>• Reselling, reusing, or redistributing client work.</li>
                <li>• Missing deadlines without notifying 365writers.</li>
                <li>• Requesting or accepting payments outside official 365writers payment channels.</li>
                <li>• Sharing client details or confidential project information.</li>
              </ul>
            </div>

            {/* Writer Payment Policy */}
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">💰</span>
                <h3 className="text-xl font-semibold">Payment Policy</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-10">
                <li>• Writers will receive payments according to schedules and terms set by 365writers.</li>
                <li>• Any disputes regarding payment should be reported immediately to <a href="mailto:info365writers@gmail.com" className="text-primary hover:underline">info365writers@gmail.com</a>.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Client Policies */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">2. Policies for Clients</h2>
            </div>
            
            {/* Client Responsibilities */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold">Client Responsibilities</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-7">
                <li>• Provide clear, accurate, and complete order instructions.</li>
                <li>• Respond to clarification requests promptly to avoid delays.</li>
                <li>• Respect agreed deadlines and payment terms.</li>
              </ul>
            </div>

            {/* Order & Revision Policy */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Order & Revision Policy</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-7">
                <li>• Orders will be delivered on or before the agreed deadline.</li>
                <li>• Clients are entitled to reasonable revisions, provided they remain within the original instructions.</li>
                <li>• Significant changes beyond the original scope may incur additional charges.</li>
              </ul>
            </div>

            {/* Client Payment Policy */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">💰</span>
                <h3 className="text-xl font-semibold">Payment Policy</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-10">
                <li>• Payments must be made only through official 365writers channels.</li>
                <li>• Refunds are only considered if the delivered work clearly violates the agreed requirements.</li>
                <li>• No refunds will be processed after the order is accepted and marked as completed.</li>
              </ul>
            </div>

            {/* Confidentiality */}
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Confidentiality</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground ml-7">
                <li>• Client information and project details will remain private and secure.</li>
                <li>• Work delivered to clients will never be resold or reused.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* General Terms */}
        <Card className="mb-12 shadow-soft border-0">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">3. General Terms & Conditions</h2>
            <p className="text-muted-foreground mb-6">
              By using 365writers, both writers and clients agree to the following terms:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Service Agreement</h3>
                <p className="text-muted-foreground">365writers acts as a platform connecting clients and writers. Both parties must follow the above-stated policies.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Deadlines</h3>
                <p className="text-muted-foreground">Timely delivery is important. Extensions must be communicated and agreed upon in advance.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Intellectual Property</h3>
                <p className="text-muted-foreground">Upon full payment, clients own the rights to the delivered work. Writers may not use or redistribute the work.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Disputes</h3>
                <p className="text-muted-foreground">Any disagreements must first be reported to <a href="mailto:info365writers@gmail.com" className="text-primary hover:underline">info365writers@gmail.com</a>. The company will mediate fairly between parties.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Termination of Service</h3>
                <p className="text-muted-foreground">365writers reserves the right to suspend or terminate any account that violates these policies.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Questions or Concerns?</h3>
            <p className="text-muted-foreground mb-4">
              For any questions, concerns, or disputes, please contact us directly at:
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

export default Terms;