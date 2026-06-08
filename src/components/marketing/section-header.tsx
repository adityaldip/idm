import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
      <div
        className={cn(
          "mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-gold to-gold-dark",
          align === "center" && "mx-auto",
        )}
      />
    </div>
  );
}
