import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { FileText, User, Users, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const userType = searchParams.get('type') || 'client';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log("Auth form submitted");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container py-16">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account to start using 365writers'
              }
            </p>
          </div>

          <Card className="shadow-medium border-0">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant={isLogin ? "default" : "ghost"}
                  onClick={() => setIsLogin(true)}
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button
                  variant={!isLogin ? "default" : "ghost"}
                  onClick={() => setIsLogin(false)}
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>
              
              {!isLogin && (
                <Tabs value={userType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="client" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client
                    </TabsTrigger>
                    <TabsTrigger value="writer" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Writer
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      placeholder="Confirm your password"
                      required 
                    />
                  </div>
                )}
                
                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <Link to="/auth/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant={userType === 'writer' ? 'writer' : userType === 'client' ? 'client' : 'default'}
                  size="lg"
                >
                  {isLogin 
                    ? 'Sign In' 
                    : `Create ${userType === 'writer' ? 'Writer' : 'Client'} Account`
                  }
                </Button>
                
                {!isLogin && userType === 'writer' && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Writer accounts require verification before activation</p>
                  </div>
                )}
              </form>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8 text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/legal/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;