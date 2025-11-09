
'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, List } from "lucide-react";
import { FundingProject } from "@/lib/data";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { isAdmin, getFundingProjects, deleteProject } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FundingForm } from "@/components/funding-form";
import { FundProjectDialog } from "@/components/fund-project-dialog";


export default function FundingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);

  const fetchProjects = useCallback(async () => {
    const fetchedProjects = await getFundingProjects();
    setProjects(fetchedProjects);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const adminStatus = await isAdmin(currentUser.email);
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEdit = (project: FundingProject) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    }
  }
  
  const handleFund = (project: FundingProject) => {
    setSelectedProject(project);
    setIsFundOpen(true);
  }

  const onFormSuccess = () => {
    setIsFormOpen(false);
    fetchProjects();
  }
  
  const onFundSuccess = () => {
    setIsFundOpen(false);
    fetchProjects();
  }


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Crowdfunding Projects</h1>
        {userIsAdmin && (
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" /> Add New Project
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={(project.current / project.goal) * 100} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Raised: ₹{project.current.toLocaleString('en-IN')}</span>
                  <span>Goal: ₹{project.goal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
               <div className="flex w-full gap-2">
                 <Button className="flex-1" disabled={!user || userIsAdmin} onClick={() => handleFund(project)}>Fund Project</Button>
                  {userIsAdmin && (
                    <>
                      <Button asChild variant="secondary" className="flex-1">
                        <Link href={`/dashboard/funding/${project.id}`}><List className="h-4 w-4 mr-2" /> Transactions</Link>
                      </Button>
                    </>
                  )}
               </div>
              {userIsAdmin && (
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(project)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(project.id)}><Trash className="h-4 w-4" /></Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          <FundingForm project={selectedProject} onFormSuccess={onFormSuccess} />
        </DialogContent>
      </Dialog>
      
      {selectedProject && user && (
         <FundProjectDialog user={user} project={selectedProject} open={isFundOpen} onOpenChange={setIsFundOpen} onFormSuccess={onFundSuccess} />
      )}
    </>
  );
}
