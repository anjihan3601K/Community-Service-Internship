
'use client';

import Link from 'next/link';
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { FundingStatus } from "@/components/dashboard/funding-status";
import { RecentIssues } from "@/components/dashboard/recent-issues";
import ClientDialog from "@/components/client-dialog";
import { getIssues, getFundingProjects, isAdmin, getUserProfile } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { UserGreeting } from '@/components/dashboard/user-greeting';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Issue, FundingProject, UserProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <Skeleton className="h-24 w-full my-4" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-96 xl:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </>
  );
}


export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fundingProjects, setFundingProjects] = useState<FundingProject[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user-specific data
        const [userProfile, adminStatus] = await Promise.all([
          getUserProfile(currentUser.uid),
          isAdmin(currentUser.email || ''),
        ]);
        setProfile(userProfile);
        setUserIsAdmin(adminStatus);
      } else {
        // Handle logged-out state
        setUser(null);
        setProfile(null);
        setUserIsAdmin(false);
      }
      setLoading(false);
    });

    // Fetch non-user-specific data
    async function fetchData() {
        const [issuesData, fundingProjectsData] = await Promise.all([
            getIssues(),
            getFundingProjects(),
        ]);
        setIssues(issuesData);
        setFundingProjects(fundingProjectsData);
    }
    fetchData();
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Community Dashboard</h1>
         <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/waste-report">
                <Leaf className="h-3.5 w-3.5 mr-1" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Waste Guidance
                </span>
              </Link>
            </Button>
           <ClientDialog />
         </div>
      </div>
      <>
          <UserGreeting
            userName={profile?.name || user?.email}
            userIsAdmin={userIsAdmin}
          />
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <OverviewCards issues={issues} fundingProjects={fundingProjects} />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <RecentIssues issues={issues} />
              <FundingStatus fundingProjects={fundingProjects} />
          </div>
      </>
    </>
  );
}
