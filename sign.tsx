import { useState, FC } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useUser } from '@/components/user-context';
import { Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SignPage: FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [mode, setMode] = useState<'preview' | 'live'>('preview');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Simulated document with 3 pages
  const [isSigned, setIsSigned] = useState(false);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleSign = async () => {
    try {
      // In a real app, we would use the documentId and signerId from the URL or context
      const documentId = 1; // Example ID
      const signerId = 1; // Example ID

      const response = await apiRequest('POST', '/api/sign', {
        documentId,
        signerId,
        mode
      });

      const data = await response.json();

      if (data.success) {
        setIsSigned(true);
        toast({
          title: 'Document signed successfully',
          description: data.message
        });

        // Redirect to upload page after signing
        setTimeout(() => {
          setLocation('/upload');
        }, 1500);
      } else {
        throw new Error(data.message || 'Signing failed');
      }
    } catch (error: any) {
      toast({
        title: 'Signing failed',
        description: error.message || 'An error occurred during signing',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-center mb-8">
        <img src="/logo.svg" alt="Signhey" className="h-12" />
      </div>
      
      <ProgressIndicator 
        steps={['Agreement', 'Files', 'Payment']} 
        currentStep={0} 
        mode={mode}
        onModeChange={setMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Legal Services Agreement</CardTitle>
          <CardDescription>
            Please review the document carefully before signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Document Viewer */}
          <div className="relative bg-white border rounded-md shadow-sm min-h-[400px] overflow-hidden">
            {/* PREVIEW Mode Watermark */}
            {mode === 'preview' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rotate-[-35deg] text-[rgba(243,129,68,0.1)] text-9xl font-bold">
                  PREVIEW
                </div>
              </div>
            )}
            
            {/* Document Content - BoldSign Placeholder */}
            <div className="p-8 relative z-10">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Legal Services Agreement</h2>
                <p className="text-sm text-slate-700">Page {currentPage} of {totalPages}</p>
                
                {currentPage === 1 && (
                  <div className="space-y-3">
                    <p>This Legal Services Agreement (the "Agreement") is entered into as of [Date] by and between:</p>
                    <p className="font-medium">COMPANY: Signhey Legal Services, Inc.</p>
                    <p className="font-medium">CLIENT: [Client Name]</p>
                    <p className="mt-4">1. SCOPE OF SERVICES</p>
                    <p>Company agrees to provide document signing services (the "Services") to Client as described in this Agreement.</p>
                  </div>
                )}
                
                {currentPage === 2 && (
                  <div className="space-y-3">
                    <p className="font-medium">2. FEES AND PAYMENT</p>
                    <p>Client agrees to pay Company for the Services according to the current pricing plan selected.</p>
                    <p className="font-medium">3. TERM AND TERMINATION</p>
                    <p>This Agreement shall commence on the date of signing and shall continue until completion of the Services or termination by either party.</p>
                  </div>
                )}
                
                {currentPage === 3 && (
                  <div className="space-y-3">
                    <p className="font-medium">4. CONFIDENTIALITY</p>
                    <p>Each party agrees to keep confidential all information received from the other party.</p>
                    <p className="font-medium">5. GOVERNING LAW</p>
                    <p>This Agreement shall be governed by the laws of [Jurisdiction].</p>
                    <div className="mt-8 pt-4 border-t">
                      <p className="font-medium">Signature:</p>
                      {isSigned ? (
                        <div className="flex items-center text-green-600 font-medium mt-2">
                          <Check className="h-5 w-5 mr-1" />
                          Signed Electronically
                        </div>
                      ) : (
                        <div className="h-10 border-b border-dotted border-slate-400 mt-2"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            
            <div className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-slate-500">
            {mode === 'preview' ? (
              <div className="flex items-center text-orange-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                PREVIEW mode: No real signature will be recorded
              </div>
            ) : (
              <div className="flex items-center text-blue-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                LIVE mode: Your legal signature will be recorded
              </div>
            )}
          </div>
          <Button 
            onClick={handleSign}
            disabled={isSigned || currentPage !== totalPages}
          >
            {isSigned ? 'Signed' : 'Sign Document'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignPage;