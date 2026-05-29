import React from "react";
import { FileText, ImageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { cn } from "lib/utils";

type FileInfoCardProps = {
  file: File;
  previewUrl?: string | null;
  className?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileInfoCard({
  file,
  previewUrl,
  className,
}: FileInfoCardProps) {
  const isImage = file.type.startsWith("image/");

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-primary" />
          ) : (
            <FileText className="h-4 w-4 text-primary" />
          )}
          File details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </p>
            <p className="truncate font-medium">{file.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Size
            </p>
            <p className="font-medium">{formatBytes(file.size)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Type
            </p>
            <p className="font-medium">{file.type || "Unknown"}</p>
          </div>
        </div>
        {previewUrl && isImage && (
          <div className="overflow-hidden rounded-md border border-border bg-muted/40 p-2">
            <img
              src={previewUrl}
              alt="Certificate preview"
              className="mx-auto max-h-48 w-full object-contain"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
