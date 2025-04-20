import { FC, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  documentId?: number;
  mode: "preview" | "live";
  onUploadComplete: (fileUrl: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

const FileUpload: FC<FileUploadProps> = ({
  documentId,
  mode,
  onUploadComplete,
  acceptedTypes = ".pdf,.doc,.docx",
  maxSize = 10 // 10MB
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedTypesList = acceptedTypes.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    
    if (fileType && !acceptedTypesList.includes(fileType)) {
      toast({
        title: "Invalid file type",
        description: `File type must be one of: ${acceptedTypes}`,
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    
    try {
      // If in preview mode, simulate upload but don't actually store file
      if (mode === "preview") {
        // Simulate upload progress
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 10;
          setProgress(Math.min(currentProgress, 100));
          if (currentProgress >= 100) {
            clearInterval(interval);
            // Return a placeholder URL for preview mode
            onUploadComplete(`preview-file-${Date.now()}.pdf`);
            setUploading(false);
            toast({
              title: "Upload complete (Preview)",
              description: "File would be uploaded in LIVE mode",
            });
          }
        }, 300);
      } else {
        // Real upload for LIVE mode
        const formData = new FormData();
        formData.append('file', file);
        if (documentId) {
          formData.append('documentId', documentId.toString());
        }

        // Simulate upload progress (would be replaced with real progress tracking)
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 5;
          setProgress(Math.min(currentProgress, 95)); // Max 95% until complete
          if (currentProgress >= 95) {
            clearInterval(progressInterval);
          }
        }, 200);

        const response = await apiRequest('POST', '/api/upload', formData);
        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error('File upload failed');
        }
        
        const data = await response.json();
        setProgress(100);
        onUploadComplete(data.fileUrl);
        toast({
          title: "Upload complete",
          description: "File has been uploaded successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file",
        variant: "destructive"
      });
    } finally {
      if (mode === "live") {
        setUploading(false);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Upload your document</h3>
          <p className="mt-1 text-xs text-slate-500">
            {mode === "preview" 
              ? "Upload PDF or Word document (Preview mode - file will not be stored)" 
              : "Upload PDF or Word document"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Max file size: {maxSize}MB
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={acceptedTypes}
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-slate-100 p-2 rounded-md">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "application/octet-stream"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {!uploading && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={clearFile}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpload}>
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
