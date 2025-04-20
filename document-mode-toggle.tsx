import { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DocumentModeToggleProps {
  mode: "preview" | "live";
  onChange: (mode: "preview" | "live") => void;
  disabled?: boolean;
  className?: string;
}

const DocumentModeToggle: FC<DocumentModeToggleProps> = ({ 
  mode, 
  onChange, 
  disabled = false,
  className
}) => {
  const handleToggle = (checked: boolean) => {
    onChange(checked ? "live" : "preview");
  };

  return (
    <div className={cn("p-3 bg-slate-100 rounded-md", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Mode:</span>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-sm", 
            mode === "preview" ? "text-slate-900 font-medium" : "text-slate-500"
          )}>
            PREVIEW
          </span>
          <Switch 
            checked={mode === "live"} 
            onCheckedChange={handleToggle}
            disabled={disabled}
            id="mode-toggle"
          />
          <Label 
            htmlFor="mode-toggle" 
            className={cn(
              "text-sm cursor-pointer", 
              mode === "live" ? "text-slate-900 font-medium" : "text-slate-500"
            )}
          >
            LIVE
          </Label>
        </div>
      </div>
      {mode === "preview" ? (
        <p className="mt-1 text-xs text-slate-500">
          PREVIEW mode: Test your document flows without using your quota.
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          LIVE mode: Send documents for real signatures. Uses your monthly quota.
        </p>
      )}
    </div>
  );
};

export default DocumentModeToggle;
