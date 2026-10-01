import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** "inverted" is for headers placed on dark (navy) sections. */
  tone?: "default" | "inverted";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "default",
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
      <h2
        className={cn(
          "font-heading mt-2 text-3xl font-bold tracking-tight md:text-4xl",
          tone === "inverted" && "text-white",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 text-base md:text-lg",
            tone === "inverted" ? "text-white/75" : "text-muted-foreground",
          )}
        >
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
