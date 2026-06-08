import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/company";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "full";
}

const iconSizeMap = {
  sm: { size: 32, className: "size-8" },
  md: { size: 40, className: "size-10" },
  lg: { size: 56, className: "size-14" },
  xl: { size: 72, className: "size-18" },
};

export function Logo({
  className,
  href = "/",
  size = "md",
  variant = "light",
}: LogoProps) {
  const icon = iconSizeMap[size];

  if (variant === "full") {
    return (
      <Link href={href} className={cn("inline-flex shrink-0", className)}>
        <Image
          src="/images/logo/idm-full.png"
          alt={COMPANY.legalName}
          width={220}
          height={120}
          className="h-14 w-auto object-contain"
          priority
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center gap-2.5", className)}
    >
      <Image
        src="/images/logo/logo-light-2.png"
        alt={COMPANY.legalName}
        width={icon.size}
        height={icon.size}
        className={cn(icon.className, "shrink-0 object-contain")}
        priority
        unoptimized
      />
      <div className="hidden flex-col leading-tight sm:flex">
        <span
          className={cn(
            "font-heading font-bold tracking-wide text-foreground",
            size === "xl"
              ? "text-base lg:text-lg"
              : size === "lg"
                ? "text-sm lg:text-base"
                : "text-xs lg:text-sm",
          )}
        >
          {COMPANY.legalName}
        </span>
        <span
          className={cn(
            "text-muted-foreground",
            size === "xl"
              ? "text-xs lg:text-sm"
              : size === "lg"
                ? "text-[11px] lg:text-xs"
                : "text-[10px] lg:text-xs",
          )}
        >
          {COMPANY.tagline}
        </span>
      </div>
    </Link>
  );
}
