import { FC } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  mode: 'preview' | 'live';
  onModeChange?: (mode: 'preview' | 'live') => void;
  className?: string;
}

const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  mode,
  onModeChange,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-slate-800">Document Signing Process</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-500">Mode:</span>
          <div className="flex border rounded-lg overflow-hidden">
            <Toggle
              pressed={mode === 'preview'}
              onPressedChange={() => onModeChange?.('preview')}
              className={`rounded-none border-0 ${mode === 'preview' ? 'bg-orange-50 text-orange-700' : ''}`}
            >
              PREVIEW
            </Toggle>
            <Separator orientation="vertical" className="h-full" />
            <Toggle
              pressed={mode === 'live'}
              onPressedChange={() => onModeChange?.('live')}
              className={`rounded-none border-0 ${mode === 'live' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              LIVE
            </Toggle>
          </div>
        </div>
      </div>
      
      {/* Steps */}
      <div className="flex items-center w-full">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 relative">
            {/* Step Number */}
            <div className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 z-10 
                  ${index < currentStep 
                    ? 'bg-primary text-white border-primary' 
                    : index === currentStep 
                      ? 'border-primary text-primary bg-white' 
                      : 'border-slate-300 text-slate-400 bg-white'
                  }`}
              >
                {index + 1}
              </div>
              
              {/* Step Name */}
              <div className="ml-2 text-sm font-medium">
                {step}
                {index === currentStep && mode === 'preview' && (
                  <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                    Preview
                  </Badge>
                )}
                {index === currentStep && mode === 'live' && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-5 left-10 w-full h-0.5 
                  ${index < currentStep ? 'bg-primary' : 'bg-slate-200'}`}
              ></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mode Info */}
      {mode === 'preview' ? (
        <div className="mt-6 p-3 bg-orange-50 rounded-md flex items-start text-orange-800 text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">PREVIEW Mode</p>
            <p>Use this mode to test the workflow without consuming your document signing quota.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-3 bg-blue-50 rounded-md flex items-start text-blue-800 text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">LIVE Mode</p>
            <p>This will create legally binding documents and consume your quota. Make sure all details are correct.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;