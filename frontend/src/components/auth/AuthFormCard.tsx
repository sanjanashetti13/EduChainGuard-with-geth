import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { cn } from "lib/utils";

type AuthFormCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function AuthFormCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthFormCardProps) {
  return (
    <Card className={cn("w-full border-border shadow-lg", className)}>
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
