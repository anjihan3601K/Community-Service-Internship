
'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { FundingProject } from "@/lib/data";
import { FundProjectDialog } from "@/components/fund-project-dialog";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";


export function FundingStatus({ fundingProjects: initialProjects }: { fundingProjects: FundingProject[] }) {
  const [projects, setProjects] = useState<FundingProject[]>(initialProjects);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);
  const [user, setUser] = useState<User | null>(null);

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleFund = (project: FundingProject) => {
    setSelectedProject(project);
    setIsFundOpen(true);
  }

  const onFundSuccess = () => {
    setIsFundOpen(false);
    // In a real app you might want to refetch the data
    // For now, we will just close the dialog. The dashboard revalidates on its own.
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding Status</CardTitle>
        <CardDescription>
          Progress of community-funded projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="space-y-2">
            <div className="flex justify-between items-baseline">
                <h4 className="font-semibold">{project.title}</h4>
                <p className="text-sm text-muted-foreground">
                    ₹{project.current.toLocaleString('en-IN')} / <span className="font-medium text-foreground">₹{project.goal.toLocaleString('en-IN')}</span>
                </p>
            </div>
            <Progress value={(project.current / project.goal) * 100} />
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{project.description}</p>
                <Button variant="outline" size="sm" onClick={() => handleFund(project)} disabled={!user}>Fund</Button>
            </div>
          </div>
        ))}
      </CardContent>
       {selectedProject && (
         <FundProjectDialog user={user} project={selectedProject} open={isFundOpen} onOpenChange={setIsFundOpen} onFormSuccess={onFundSuccess} />
      )}
    </Card>
  );
}
