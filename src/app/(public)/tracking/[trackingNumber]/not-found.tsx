import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingSearch } from "@/components/tracking/tracking-search";

export default function TrackingNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 lg:px-8">
      <PackageX className="mx-auto size-12 text-muted-foreground" />
      <h1 className="mt-4 font-heading text-2xl font-bold">Shipment Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find a shipment with that tracking number. Please check
        the number and try again.
      </p>
      <div className="mt-8">
        <TrackingSearch />
      </div>
      <Button
        nativeButton={false}
        render={<Link href="/" />}
        variant="outline"
        className="mt-6"
      >
        Back to Home
      </Button>
    </div>
  );
}
