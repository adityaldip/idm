export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
