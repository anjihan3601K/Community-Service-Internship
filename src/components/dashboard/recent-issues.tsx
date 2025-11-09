
'use client';
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Wrench, Trash, Trash2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Issue } from "@/lib/data";
import { deleteIssue, isAdmin } from "@/app/actions";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

const statusVariant = {
  "Resolved": "default",
  "In Progress": "secondary",
  "Reported": "destructive",
} as const;

const iconMap = {
    "Waste": <Trash2 className="h-4 w-4" />,
    "Infrastructure": <Wrench className="h-4 w-4" />,
}

export function RecentIssues({ issues }: { issues: Issue[]}) {
  const [currentIssues, setCurrentIssues] = useState(issues);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const adminStatus = await isAdmin(currentUser.email);
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      await deleteIssue(id);
      setCurrentIssues(currentIssues.filter(issue => issue.id !== id));
    }
  };

  const recentIssues = [...currentIssues].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>
            A list of recently reported issues in the community.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/issues">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Photo</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              {userIsAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <div className="font-medium">{issue.location}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {issue.description}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {issue.photoURL ? (
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{issue.location}</DialogTitle>
                          </DialogHeader>
                           <Image src={issue.photoURL} alt={issue.description} width={500} height={500} className="rounded-md object-contain" />
                        </DialogContent>
                      </Dialog>
                  ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={statusVariant[issue.status]}>
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{issue.date}</TableCell>
                <TableCell className="text-right">
                  {userIsAdmin && (
                     <Button variant="destructive" size="icon" onClick={() => handleDelete(issue.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
