import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Skeleton } from "components/ui/skeleton";
import { Badge } from "components/ui/badge";
import { cn } from "lib/utils";

export type VerificationHistoryRow = {
  hash: string;
  verified: boolean;
  timestamp?: string;
  filename?: string;
  tx_hash?: string;
};

type VerificationHistoryTableProps = {
  title?: string;
  rows: VerificationHistoryRow[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
};

export default function VerificationHistoryTable({
  title = "Recent activity",
  rows,
  loading = false,
  error = null,
  emptyMessage = "No records yet.",
  className,
}: VerificationHistoryTableProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Hash</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={`${row.hash}-${i}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Badge variant={row.verified ? "success" : "secondary"}>
                        {row.verified ? "Verified" : "Not found"}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs">
                      {row.hash}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.timestamp
                        ? new Date(row.timestamp).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
