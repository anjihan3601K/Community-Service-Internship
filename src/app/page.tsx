
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Mana Ooru Mana Badyatha</CardTitle>
          <CardDescription>
            (Our Village, Our Responsibility)
            <br />
            Welcome to the community portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <Button asChild className="w-full">
            <Link href="/login">Login to Continue</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
