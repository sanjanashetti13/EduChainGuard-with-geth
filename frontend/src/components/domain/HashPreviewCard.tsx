import React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { cn } from "lib/utils";

type HashPreviewCardProps = {
  hash: string;
  label?: string;
  className?: string;
};

export default function HashPreviewCard({
  hash,
  label = "SHA-256 fingerprint",
  className,
}: HashPreviewCardProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast.success("Hash copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy hash");
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={copy}>
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy hash</span>
        </Button>
      </CardHeader>
      <CardContent>
        <code className="block break-all rounded-md bg-muted px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
          {hash}
        </code>
      </CardContent>
    </Card>
  );
}
