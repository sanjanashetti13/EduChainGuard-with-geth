import React, { useRef } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { Button } from "components/ui/button";
import { cn } from "lib/utils";

export type UploadDropzoneProps = {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
  id?: string;
};

export default function UploadDropzone({
  file,
  onFileSelect,
  accept = "application/pdf,image/*",
  disabled = false,
  loading = false,
  hint = "PDF or image · max one file",
  id = "certificate-file-input",
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleFiles = (list: FileList | null) => {
    const f = list?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <div
      role="presentation"
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
        dragActive && "border-primary bg-primary/5",
        !dragActive && "border-border bg-muted/30 hover:border-primary/40",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {loading ? (
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      ) : (
        <FileUp className="h-10 w-10 text-muted-foreground" aria-hidden />
      )}

      <p className="mt-4 text-sm font-medium text-foreground">
        Drag and drop your certificate
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-4"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || loading}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file && (
        <p className="mt-4 max-w-full truncate text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{file.name}</span>
        </p>
      )}
    </div>
  );
}
