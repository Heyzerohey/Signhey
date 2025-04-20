import { useState, useRef, FC, DragEvent, ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProgressIndicator from '@/components/ProgressIndicator';
import { AlertCircle, Upload as UploadIcon, File, FileText, CheckCircle, X } from 'lucide-react';

interface FileUploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const getFileIcon = (filename: string) => {
  const ext = getFileExtension(filename);
  
  switch (ext) {
    case 'pdf':
      return <File className="h-10 w-10 text-red-500" />;
    case 'docx':
    case 'doc':
      return <FileText className="h-10 w-10 text-blue-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <FileText className="h-10 w-10 text-green-500" />;
    default:
      return <File className="h-10 w-10 text-slate-500" />;
  }
};

const Upload: FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'preview' | 'live'>('preview');
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected';
    
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload a PDF, DOCX, JPG, or PNG file.';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }
    
    return null;
  };
  
  const handleFile = async (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setFileUpload({
        file: null,
        progress: 0,
        status: 'error',
        error
      });
      
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
      
      return;
    }
    
    setFileUpload({
      file,
      progress: 0,
      status: 'uploading'
    });
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setFileUpload(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }));
    }, 300);
    
    try {
      // In PREVIEW mode, only simulate the upload
      if (mode === 'preview') {
        // Simulate a delay for the upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(progressInterval);
        
        setFileUpload(prev => ({
          ...prev,
          progress: 100,
          status: 'success'
        }));
        
        toast({
          title: 'Upload simulated in PREVIEW mode',
          description: 'In PREVIEW mode, files are not actually uploaded.'
        });
      } else {
        // In LIVE mode, actually upload the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);
        
        const response = await apiRequest('POST', '/api/upload', formData);
        
        const data = await response.json();
        
        clearInterval(progressInterval);
        
        if (data.success) {
          setFileUpload(prev => ({
            ...prev,
            progress: 100,
            status: 'success'
          }));
          
          toast({
            title: 'Upload successful',
            description: 'Your document has been uploaded successfully.'
          });
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      }
      
      // Wait a bit before redirecting to the payment page
      setTimeout(() => {
        setLocation('/payment');
      }, 1500);
    } catch (error: any) {
      clearInterval(progressInterval);
      
      setFileUpload(prev => ({
        ...prev,
        progress: 0,
        status: 'error',
        error: error.message || 'An error occurred during upload'
      }));
      
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload',
        variant: 'destructive'
      });
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileUpload.status === 'uploading') return;
    
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (fileUpload.status === 'uploading') return;
    
    const files = e.target.files;
    
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const resetUpload = () => {
    setFileUpload({
      file: null,
      progress: 0,
      status: 'idle'
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-center mb-8">
        <img src="/logo.svg" alt="Signhey" className="h-12" />
      </div>
      
      <ProgressIndicator 
        steps={['Agreement', 'Files', 'Payment']} 
        currentStep={1} 
        mode={mode}
        onModeChange={setMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload the document you want to add to the signing process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fileUpload.file && fileUpload.status !== 'idle' ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4">
                  {getFileIcon(fileUpload.file.name)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{fileUpload.file.name}</p>
                      <p className="text-sm text-slate-500">
                        {(fileUpload.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {fileUpload.status !== 'uploading' && (
                      <button 
                        onClick={resetUpload}
                        className="text-slate-500 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {fileUpload.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={fileUpload.progress} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        Uploading... {fileUpload.progress}%
                      </p>
                    </div>
                  )}
                  
                  {fileUpload.status === 'success' && (
                    <div className="flex items-center text-green-600 mt-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Upload complete</span>
                    </div>
                  )}
                  
                  {fileUpload.status === 'error' && (
                    <div className="flex items-center text-red-600 mt-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{fileUpload.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.docx,.jpg,.jpeg,.png"
              />
              <UploadIcon className="h-12 w-12 mx-auto text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-700">Drag and drop your file here</h3>
              <p className="mt-2 text-sm text-slate-500">
                or <span className="text-primary font-medium">browse</span> to select a file
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Supported formats: PDF, DOCX, JPG, PNG (Max 10MB)
              </p>
              
              {mode === 'preview' && (
                <div className="mt-6 p-3 bg-orange-50 rounded-md text-orange-800 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>In PREVIEW mode, files won't be stored permanently.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/sign')}
          >
            Back
          </Button>
          
          <Button 
            disabled={!(fileUpload.file && fileUpload.status === 'success')}
            onClick={() => setLocation('/payment')}
          >
            Continue to Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Upload;