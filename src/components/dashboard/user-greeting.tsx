
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

type UserGreetingProps = {
  userName?: string | null;
  userIsAdmin?: boolean;
};

export function UserGreeting({ userName, userIsAdmin }: UserGreetingProps) {
  if (!userName) {
    return <CardSkeleton />;
  }

  const welcomeMessage = `Hello, ${userName}. Thank you for your continued support in making Ramaraju Lanka a better place.`;

  return (
    <Card className="my-4 bg-primary/10 border-primary/20">
        <CardHeader>
            <CardTitle>{userIsAdmin ? "Welcome Officer!" : "Welcome Back!"}</CardTitle>
            <CardDescription>{welcomeMessage}</CardDescription>
        </CardHeader>
    </Card>
  );
}


function CardSkeleton() {
    return (
        <Card className="my-4">
            <CardHeader>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
        </Card>
    )
}
