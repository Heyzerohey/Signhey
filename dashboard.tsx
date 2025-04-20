import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/user-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentModeToggle from "@/components/document-mode-toggle";
import DocumentList from "@/components/document-list";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { getTierDetails } from "@/lib/stripe";
import { PlusIcon } from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  const [documentMode, setDocumentMode] = useState<"preview" | "live">("preview");
  const [documentFilter, setDocumentFilter] = useState<string>("all");

  const { data: userProfile, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    }
  });

  // If user exists and quota is loaded, determine if we can switch to live mode
  const canUseLiveMode = userProfile?.tier !== 'free' && 
    (userProfile?.liveUsed < userProfile?.liveQuota);

  // When changing document mode, check if we can use live mode
  const handleModeChange = (mode: "preview" | "live") => {
    if (mode === "live" && !canUseLiveMode) {
      // Don't allow switching to live mode if no quota available
      return;
    }
    setDocumentMode(mode);
  };

  const tierDetails = user ? getTierDetails(user.tier) : getTierDetails('free');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start">
            {/* Sidebar */}
            <div className="w-full md:w-48 flex-shrink-0 mb-6 md:mb-0 md:mr-6">
              <div className="space-y-1">
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <span className="font-medium text-primary">Documents</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/dashboard/templates">Templates</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/dashboard/contacts">Contacts</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/profile">Settings</Link>
                </Button>
              </div>
              <div className="mt-6">
                <Card className="bg-slate-100 p-4">
                  {isLoadingUser ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-2 w-full mt-2" />
                      <Skeleton className="h-4 w-20 mt-4" />
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium text-slate-900 text-sm">{tierDetails.name} Tier</h4>
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="flex justify-between items-center">
                          <span>LIVE Documents</span>
                          <span className="font-medium">
                            {userProfile?.liveUsed || 0}/{tierDetails.quota}
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(
                                100, 
                                ((userProfile?.liveUsed || 0) / Math.max(1, tierDetails.quota)) * 100
                              )}%` 
                            }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span>PREVIEW Mode</span>
                          <span className="font-medium">Unlimited</span>
                        </div>
                      </div>
                      {userProfile?.tier === 'free' && (
                        <div className="mt-4">
                          <Button size="sm" variant="outline" className="w-full" asChild>
                            <Link href="/subscribe?tier=pro">Upgrade to Pro</Link>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2 md:mb-0">My Documents</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Select value={documentFilter} onValueChange={setDocumentFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter documents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Documents</SelectItem>
                      <SelectItem value="waiting">Waiting for Signature</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild>
                    <Link href="/document/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Document
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <DocumentModeToggle 
                mode={documentMode} 
                onChange={handleModeChange} 
                disabled={userProfile?.tier === 'free'} 
                className="mb-6"
              />
              
              {/* Document List */}
              <DocumentList />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
