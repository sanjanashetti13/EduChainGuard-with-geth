import React from "react";
import { Link } from "react-router-dom";
import { Mail, Shield, User } from "lucide-react";

import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { useAuth } from "hooks/useAuth";
import { dashboardPathForRole } from "utils/routeForRole";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-muted-foreground">You are not signed in.</p>
        <Button className="mt-4" asChild>
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your EduChainGuard account details
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user.email}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize shrink-0">
            {user.role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to upload certificates, verify records, or open your
            role workspace.
          </p>
          <Button asChild>
            <Link to={dashboardPathForRole(user.role)}>
              <Shield className="mr-2 h-4 w-4" />
              Go to workspace
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
