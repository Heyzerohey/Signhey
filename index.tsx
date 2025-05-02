import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useUser } from "@/components/user-context";
import { 
  Check, 
  AlertCircle, 
  Upload, 
  FileText, 
  CreditCard, 
  User, 
  UserPlus, 
  CreditCard as StripeIcon 
} from "lucide-react";

const Index = () => {
  const { user } = useUser();
  const [signerMode, setSignerMode] = useState<'preview' | 'live'>('preview');
  const [dashboardMode, setDashboardMode] = useState<'preview' | 'live'>('preview');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src="/logo.svg" alt="Signhey" className="h-12 mx-auto mb-8" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">Document signing</span>
              <span className="block text-primary">made simple</span>
            </h1>
            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
              Streamline your document signing process with our secure, efficient, and user-friendly platform. Perfect for professionals, businesses, and individuals.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                {user ? (
                  <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/sign">Get started</Link>
                  </Button>
                )}
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button variant="outline" size="lg" asChild>
                  <Link href="#demo">Live demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Signer Flow Preview Section */}
      <section id="demo" className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Signer Flow Preview</h2>
            <p className="mt-4 text-xl text-slate-500">
              Our streamlined 3-step process makes document signing efficient and hassle-free.
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex border rounded-lg overflow-hidden">
              <Toggle
                pressed={signerMode === 'preview'}
                onPressedChange={() => setSignerMode('preview')}
                className={`rounded-none border-0 ${signerMode === 'preview' ? 'bg-orange-50 text-orange-500' : ''}`}
              >
                PREVIEW
              </Toggle>
              <Separator orientation="vertical" className="h-full" />
              <Toggle
                pressed={signerMode === 'live'}
                onPressedChange={() => setSignerMode('live')}
                className={`rounded-none border-0 ${signerMode === 'live' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                LIVE
              </Toggle>
            </div>
          </div>
          
          {/* Steps */}
          <div className="relative">
            {/* Progress line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-slate-200"></div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1: Sign */}
              <div className="flex flex-col items-center">
                <div className="z-10 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white text-lg font-medium">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-slate-900 text-center">Agreement</h3>
                <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Document signing" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <FileText className="h-4 w-4 mr-1" />
                      Review legal document
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      E-sign with legal validity
                    </div>
                    {signerMode === 'preview' && (
                      <Badge variant="outline" className="mt-3 bg-orange-50 text-orange-500 border-orange-200">
                        Preview Mode
                      </Badge>
                    )}
                    {signerMode === 'live' && (
                      <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-600 border-blue-200">
                        Live Mode
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Step 2: Upload */}
              <div className="flex flex-col items-center">
                <div className="z-10 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white text-lg font-medium">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-slate-900 text-center">Files</h3>
                <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1568435122944-eb18553d9a72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Document upload" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload supporting files
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Multiple format support
                    </div>
                    {signerMode === 'preview' && (
                      <Badge variant="outline" className="mt-3 bg-orange-50 text-orange-500 border-orange-200">
                        Preview Mode
                      </Badge>
                    )}
                    {signerMode === 'live' && (
                      <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-600 border-blue-200">
                        Live Mode
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Step 3: Payment */}
              <div className="flex flex-col items-center">
                <div className="z-10 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white text-lg font-medium">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-slate-900 text-center">Payment</h3>
                <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Payment processing" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Secure payment processing
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Stripe integration
                    </div>
                    {signerMode === 'preview' && (
                      <Badge variant="outline" className="mt-3 bg-orange-50 text-orange-500 border-orange-200">
                        Preview Mode
                      </Badge>
                    )}
                    {signerMode === 'live' && (
                      <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-600 border-blue-200">
                        Live Mode
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/sign">Try it now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Pro Dashboard Preview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Pro Dashboard Preview</h2>
            <p className="mt-4 text-xl text-slate-500">
              Monitor your document signing activity and manage your subscription.
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex border rounded-lg overflow-hidden">
              <Toggle
                pressed={dashboardMode === 'preview'}
                onPressedChange={() => setDashboardMode('preview')}
                className={`rounded-none border-0 ${dashboardMode === 'preview' ? 'bg-orange-50 text-orange-500' : ''}`}
              >
                PREVIEW
              </Toggle>
              <Separator orientation="vertical" className="h-full" />
              <Toggle
                pressed={dashboardMode === 'live'}
                onPressedChange={() => setDashboardMode('live')}
                className={`rounded-none border-0 ${dashboardMode === 'live' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                LIVE
              </Toggle>
            </div>
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue="free" className="w-full max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="pro">Pro</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              </TabsList>
              
              <TabsContent value="free">
                <Card>
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Free Plan</h3>
                      <Badge variant="outline" className="bg-slate-100">Current Plan</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">LIVE Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in LIVE mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">0 / 0</p>
                          <p className="text-sm text-slate-500">Quota exhausted</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">PREVIEW Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in PREVIEW mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">5 / ∞</p>
                          <p className="text-sm text-slate-500">Unlimited</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center pt-4">
                        <Button variant="default" className="w-full md:w-auto">
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pro">
                <Card>
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Pro Plan</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary">$49/month</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">LIVE Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in LIVE mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">12 / 30</p>
                          <p className="text-sm text-slate-500">40% used</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">PREVIEW Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in PREVIEW mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">24 / ∞</p>
                          <p className="text-sm text-slate-500">Unlimited</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center pt-4">
                        <Button variant="default" className="w-full md:w-auto">
                          Subscribe Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="enterprise">
                <Card>
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Enterprise Plan</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary">$149/month</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">LIVE Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in LIVE mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">45 / 100</p>
                          <p className="text-sm text-slate-500">45% used</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="font-medium">PREVIEW Mode Usage</p>
                          <p className="text-sm text-slate-500">Documents processed in PREVIEW mode</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">78 / ∞</p>
                          <p className="text-sm text-slate-500">Unlimited</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center pt-4">
                        <Button variant="default" className="w-full md:w-auto">
                          Contact Sales
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Onboarding Preview */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Onboarding Preview</h2>
            <p className="mt-4 text-xl text-slate-500">
              Simple setup process to get started with Signhey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {/* Account Setup */}
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">Account Setup</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Create your account with email and set a secure password
                </p>
                <div className="mt-auto pt-4">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Step 1
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Completion */}
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">Profile Completion</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Add your personal or business information and preferences
                </p>
                <div className="mt-auto pt-4">
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                    Step 2
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Stripe Connect */}
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mb-4">
                  <StripeIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">Stripe Connect</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Link your Stripe account for seamless payment processing
                </p>
                <div className="mt-auto pt-4">
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    Step 3
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/sign">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to streamline your document signing process?
            </h2>
            <p className="mt-4 text-xl text-orange-100">
              Join thousands of satisfied users who have simplified their document workflows.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/sign">Get started for free</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;