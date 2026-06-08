import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Staff Login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-xl">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <div>
          <CardTitle className="font-heading text-xl">Staff Portal</CardTitle>
          <CardDescription>
            Sign in to access the IDM admin dashboard
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
