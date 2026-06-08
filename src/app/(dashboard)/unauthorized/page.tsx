import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <ShieldAlert className="size-12 text-muted-foreground" />
          <h1 className="font-heading text-2xl font-bold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page. Contact your
            administrator if you believe this is a mistake.
          </p>
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
