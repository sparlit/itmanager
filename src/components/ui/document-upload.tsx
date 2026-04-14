import * as React from "react";
import { Upload, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  onFileChange: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
  multiple?: boolean;
}

export function DocumentUpload({
  onFileChange,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
  maxSizeMB = 10,
  disabled = false,
  multiple = false,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (acceptedTypes.length > 0) {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedTypes.includes(fileExtension)) {
        setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
        return;
      }
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);
    onFileChange(file);
  };

   return (
     <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted/50 rounded-lg hover:border-muted/100 transition-colors cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {!isUploading ? (
        <>
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Accepted: {acceptedTypes.join(', ')}  Max size: {maxSizeMB}MB
          </p>
          <input
             type="file"
             accept={acceptedTypes.join(',')}
             className={`hidden ${disabled ? '' : ''}`}
             onChange={handleFileChange}
             disabled={disabled}
             {...(multiple ? { multiple: '' } : {})}
          />
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
        </>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-destructive">
          <X className="h-4 w-4 me-1" /> {error}
        </p>
      )}
    </div>
  );
}