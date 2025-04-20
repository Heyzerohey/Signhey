import { useState, useEffect } from "react";
import { useUser } from "@/components/user-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { CalendarIcon, CheckCircle, CreditCard, KeyIcon, LockIcon, UserIcon } from "lucide-react";
import { formatDate, getPlanQuota } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getTierDetails } from "@/lib/stripe";
import SubscriptionModal from "@/components/subscription-modal";

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    },
    enabled: !!user
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
    }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        fullName: userProfile.fullName || "",
        email: userProfile.email,
      });
    }
  }, [userProfile, profileForm]);

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const response = await apiRequest("PUT", "/api/user", data);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdating(true);
    try {
      const response = await apiRequest("PUT", "/api/auth/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully"
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your password",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionChange = (tier: string) => {
    setSelectedTier(tier);
    setShowSubscriptionModal(true);
  };

  const tierDetails = userProfile ? getTierDetails(userProfile.tier) : getTierDetails('free');

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>
                Please log in to view your profile.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Account Settings</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Your email address" 
                                {...field} 
                                disabled 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Information</CardTitle>
                  <CardDescription>
                    Manage your subscription and plan details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-8 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">Current Plan</h3>
                          <div className="flex items-center mt-1">
                            <Badge variant={userProfile?.tier === 'free' ? 'secondary' : 'default'}>
                              {tierDetails.name}
                            </Badge>
                            {userProfile?.tier !== 'free' && (
                              <Badge variant="outline" className="ml-2">
                                {getPlanQuota(userProfile?.tier)} Documents/month
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          disabled={userProfile?.tier === 'free'}
                          onClick={() => handleSubscriptionChange('free')}
                        >
                          Downgrade to Free
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      {userProfile?.tier !== 'free' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subscription ID</span>
                            <span className="font-mono text-slate-700">
                              {userProfile?.stripeSubscriptionId || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Payment Method</span>
                            <span className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-1 text-slate-400" />
                              <span>•••• 4242</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Billing Period</span>
                            <span>Monthly</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Next Billing Date</span>
                            <span>{formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</span>
                          </div>
                        </div>
                      )}
                      
                      {userProfile?.tier === 'free' && (
                        <div className="space-y-6 mt-6">
                          <div className="text-center">
                            <h3 className="font-medium text-slate-900">Upgrade your plan</h3>
                            <p className="text-slate-500 text-sm mt-1">
                              Choose a plan that works best for your needs
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-slate-200">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Pro</CardTitle>
                                <CardDescription>
                                  For professionals and small businesses
                                </CardDescription>
                                <div className="mt-2">
                                  <span className="text-3xl font-bold">$49</span>
                                  <span className="text-slate-500">/month</span>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>30 LIVE mode documents</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Advanced document templates</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Custom branding</span>
                                  </li>
                                </ul>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleSubscriptionChange('pro')}
                                >
                                  Upgrade to Pro
                                </Button>
                              </CardFooter>
                            </Card>
                            
                            <Card className="border-slate-200">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Enterprise</CardTitle>
                                <CardDescription>
                                  For organizations with advanced needs
                                </CardDescription>
                                <div className="mt-2">
                                  <span className="text-3xl font-bold">$149</span>
                                  <span className="text-slate-500">/month</span>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>100 LIVE mode documents</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>API access</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Dedicated account manager</span>
                                  </li>
                                </ul>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleSubscriptionChange('enterprise')}
                                >
                                  Upgrade to Enterprise
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        </div>
                      )}
                      
                      {userProfile?.tier !== 'free' && (
                        <div className="mt-6 space-y-6">
                          <div className="space-y-2">
                            <h3 className="font-medium text-slate-900">Usage This Month</h3>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">LIVE Documents Used</span>
                                <span className="font-medium">
                                  {userProfile?.liveUsed || 0}/{getPlanQuota(userProfile?.tier)}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(
                                      100, 
                                      ((userProfile?.liveUsed || 0) / Math.max(1, getPlanQuota(userProfile?.tier))) * 100
                                    )}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium text-slate-900">Other Available Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userProfile?.tier !== 'pro' && (
                                <Card className="border-slate-200">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Pro</CardTitle>
                                    <div className="mt-1">
                                      <span className="text-xl font-bold">$49</span>
                                      <span className="text-slate-500">/month</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pb-2 text-xs">
                                    <p>30 LIVE documents/month</p>
                                  </CardContent>
                                  <CardFooter className="pt-0">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="w-full"
                                      onClick={() => handleSubscriptionChange('pro')}
                                    >
                                      Switch to Pro
                                    </Button>
                                  </CardFooter>
                                </Card>
                              )}
                              
                              {userProfile?.tier !== 'enterprise' && (
                                <Card className="border-slate-200">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Enterprise</CardTitle>
                                    <div className="mt-1">
                                      <span className="text-xl font-bold">$149</span>
                                      <span className="text-slate-500">/month</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pb-2 text-xs">
                                    <p>100 LIVE documents/month</p>
                                  </CardContent>
                                  <CardFooter className="pt-0">
                                    <Button 
                                      size="sm" 
                                      variant={userProfile?.tier === 'pro' ? 'default' : 'outline'} 
                                      className="w-full"
                                      onClick={() => handleSubscriptionChange('enterprise')}
                                    >
                                      {userProfile?.tier === 'pro' ? 'Upgrade' : 'Switch'} to Enterprise
                                    </Button>
                                  </CardFooter>
                                </Card>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Login Activity</CardTitle>
                  <CardDescription>
                    Recent login activity on your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-slate-100 p-2 rounded-full">
                        <UserIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Current session</p>
                        <p className="text-xs text-slate-500">
                          <span className="font-medium">Browser:</span> Chrome on Windows
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="font-medium">IP Address:</span> 192.168.1.1
                        </p>
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 text-slate-400 mr-1" />
                          <p className="text-xs text-slate-500">
                            {formatDate(new Date())}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <LockIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-slate-500">
                        Protect your account with an additional security layer
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <SubscriptionModal 
        open={showSubscriptionModal} 
        tier={selectedTier}
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
