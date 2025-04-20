import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import FileUpload from "@/components/file-upload";
import DocumentModeToggle from "@/components/document-mode-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { X, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import { Document } from "@shared/schema";

const DocumentPage = () => {
  const params = useParams();
  const isNewDocument = params.id === "new";
  const documentId = isNewDocument ? null : parseInt(params.id);
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [signers, setSigners] = useState<Array<{name: string; email: string}>>([
    { name: "", email: "" }
  ]);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [mode, setMode] = useState<"preview" | "live">("preview");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch document data if editing an existing document
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ['/api/documents', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) throw new Error('Failed to fetch document');
      return res.json();
    },
    enabled: !isNewDocument && !!documentId,
  });

  // Check if user can use live mode
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    }
  });

  const canUseLiveMode = userProfile?.tier !== 'free' && 
    (userProfile?.liveUsed < userProfile?.liveQuota);

  // Handle mode change
  const handleModeChange = (newMode: "preview" | "live") => {
    if (newMode === "live" && !canUseLiveMode) {
      toast({
        title: "Cannot use LIVE mode",
        description: userProfile?.tier === 'free' 
          ? "Free tier does not include LIVE mode. Please upgrade your plan." 
          : "You have used all your LIVE document quota for this month.",
        variant: "destructive"
      });
      return;
    }
    setMode(newMode);
  };

  // Initialize form with document data when available
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setMode(document.mode as "preview" | "live");
      setFileUrl(document.fileUrl || "");
      
      if (document.signers && document.signers.length > 0) {
        // Convert string array to object array if needed
        const signerArr = typeof document.signers[0] === 'string'
          ? JSON.parse(document.signers[0] as string)
          : document.signers;
          
        setSigners(signerArr);
      }
      
      // Add message field if needed
    }
  }, [document]);

  // Add a new signer field
  const addSigner = () => {
    setSigners([...signers, { name: "", email: "" }]);
  };

  // Remove a signer field
  const removeSigner = (index: number) => {
    if (signers.length === 1) return;
    const newSigners = [...signers];
    newSigners.splice(index, 1);
    setSigners(newSigners);
  };

  // Update signer information
  const updateSigner = (index: number, field: "name" | "email", value: string) => {
    const newSigners = [...signers];
    newSigners[index] = { ...newSigners[index], [field]: value };
    setSigners(newSigners);
  };

  // Handle file upload completion
  const handleFileUpload = (fileUrl: string) => {
    setFileUrl(fileUrl);
  };

  // Save or update document
  const handleSaveDocument = async () => {
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a document title",
        variant: "destructive"
      });
      return;
    }
    
    if (!fileUrl) {
      toast({
        title: "No file uploaded",
        description: "Please upload a document file",
        variant: "destructive"
      });
      return;
    }
    
    const invalidSigners = signers.some(s => !s.name.trim() || !s.email.trim());
    if (invalidSigners) {
      toast({
        title: "Invalid signers",
        description: "Please provide name and email for all signers",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        title,
        mode,
        fileUrl,
        signers,
        message,
        userId: user?.id
      };
      
      let response;
      
      if (isNewDocument) {
        response = await apiRequest("POST", "/api/documents", payload);
      } else {
        response = await apiRequest("PUT", `/api/documents/${documentId}`, payload);
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save document");
      }
      
      const savedDocument = await response.json();
      
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      toast({
        title: isNewDocument ? "Document created" : "Document updated",
        description: isNewDocument ? "Your document has been created successfully" : "Your document has been updated successfully"
      });
      
      // Redirect to the document list
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    setLocation("/dashboard");
  };

  if (!isNewDocument && isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
            
            <h1 className="text-2xl font-bold text-slate-900">
              {isNewDocument ? "Create New Document" : "Edit Document"}
            </h1>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter document title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Document Mode</Label>
                  <DocumentModeToggle 
                    mode={mode}
                    onChange={handleModeChange}
                    disabled={userProfile?.tier === 'free'}
                  />
                  
                  {userProfile?.tier === 'free' && (
                    <div className="flex items-start mt-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                      <p>Upgrade to Pro or Enterprise to use LIVE mode</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                {fileUrl ? (
                  <div className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900">Document uploaded</p>
                        <p className="text-xs text-slate-500">{fileUrl.split('/').pop()}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFileUrl("")}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <FileUpload 
                    mode={mode}
                    documentId={documentId || undefined}
                    onUploadComplete={handleFileUpload}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Signers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {signers.map((signer, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`signer-name-${index}`}>Name</Label>
                      <Input 
                        id={`signer-name-${index}`}
                        placeholder="Signer name"
                        value={signer.name}
                        onChange={(e) => updateSigner(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`signer-email-${index}`}>Email</Label>
                      <Input 
                        id={`signer-email-${index}`}
                        type="email"
                        placeholder="email@example.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(index, "email", e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="mt-8"
                      onClick={() => removeSigner(index)}
                      disabled={signers.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addSigner}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Signer
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Message to Signers</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Add a personalized message to be included in the email to signers (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveDocument} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isNewDocument ? "Create Document" : "Update Document"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DocumentPage;
