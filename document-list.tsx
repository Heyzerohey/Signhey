import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, UserIcon, Eye, Bell, Download, Edit, Send } from "lucide-react";
import { Document } from "@shared/schema";

const DocumentList: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  
  const { data, isLoading } = useQuery<{documents: Document[], total: number}>({
    queryKey: ['/api/documents', currentPage, limit],
    queryFn: async () => {
      const res = await fetch(`/api/documents?page=${currentPage}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    }
  });
  
  const documents = data?.documents || [];
  const totalDocuments = data?.total || 0;
  const totalPages = Math.ceil(totalDocuments / limit);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="space-y-3 w-full">
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-md">
        <h3 className="text-base font-medium text-slate-700">No documents yet</h3>
        <p className="mt-1 text-sm text-slate-500">Upload your first document to get started</p>
        <Button className="mt-4" asChild>
          <Link href="/document/new">Create Document</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="border border-slate-200">
          <CardContent className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 truncate">{doc.title}</h3>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                <div className="mt-2 sm:mt-0 flex items-center text-xs text-slate-500">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                  Created on {formatDate(doc.createdAt)}
                </div>
                <div className="mt-2 sm:mt-0 flex items-center text-xs text-slate-500">
                  <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                  {(doc.signers?.length || 0)} {(doc.signers?.length || 0) === 1 ? 'signer' : 'signers'}
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    doc.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {doc.status === 'completed' ? 'Completed' : 
                    doc.status === 'waiting' ? 'Waiting for signature' : 
                    'Draft'}
                  </span>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.mode === 'live' ? 'bg-primary/20 text-primary-dark' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {doc.mode === 'live' ? 'LIVE' : 'PREVIEW'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-shrink-0 space-x-2">
              {doc.status === 'completed' ? (
                <>
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href={`/document/${doc.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </>
              ) : doc.status === 'waiting' ? (
                <>
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href={`/document/${doc.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Remind
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href={`/document/${doc.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalDocuments)} of {totalDocuments}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
