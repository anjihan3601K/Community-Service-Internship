import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Issue, FundingProject } from "@/lib/data";
import { Wrench, CheckCircle, CircleDollarSign } from "lucide-react";

export function OverviewCards({ issues, fundingProjects }: { issues: Issue[], fundingProjects: FundingProject[] }) {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
  const fundsRaised = fundingProjects.reduce((acc, p) => acc + p.current, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues Reported</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIssues}</div>
          <p className="text-xs text-muted-foreground">+2 since last week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolvedIssues}</div>
           <p className="text-xs text-muted-foreground">{totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}% resolution rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Crowdfunds</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fundingProjects.length}</div>
          <p className="text-xs text-muted-foreground">1 new project this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{fundsRaised.toLocaleString('en-IN')}</div>
          <p className="text-xs text-muted-foreground">Towards community projects</p>
        </CardContent>
      </Card>
    </>
  );
}
