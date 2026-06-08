import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="font-heading text-3xl font-bold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          Go home
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/tracking" />}
          variant="outline"
        >
          Track shipment
        </Button>
      </div>
    </div>
  );
}
