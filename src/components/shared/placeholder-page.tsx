import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase?: string;
}

export function PlaceholderPage({
  title,
  description,
  phase = "Phase 4",
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex min-h-[200px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
          This module will be implemented in {phase}.
        </CardContent>
      </Card>
    </div>
  );
}
