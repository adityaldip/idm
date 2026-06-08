"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-destructive">Something went wrong</p>
      <h1 className="font-heading text-3xl font-bold">Unexpected error</h1>
      <p className="max-w-md text-muted-foreground">
        An error occurred while loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button nativeButton={false} render={<Link href="/" />} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
