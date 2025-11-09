
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getIssues, isAdmin, updateIssueStatus, deleteIssue } from '@/app/actions';
import type { Issue } from '@/lib/data';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { MoreHorizontal, Trash, Wrench, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const statusVariant = {
  Reported: 'destructive',
  'In Progress': 'secondary',
  Resolved: 'default',
} as const;

const iconMap = {
  Waste: <Trash className="h-4 w-4" />,
  Infrastructure: <Wrench className="h-4 w-4" />,
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const { toast } = useToast();

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
    async function fetchIssues() {
      const fetchedIssues = await getIssues();
      setIssues(fetchedIssues);
    }
    fetchIssues();
  }, []);
  
  const handleStatusChange = async (id: string, status: Issue['status']) => {
    try {
      await updateIssueStatus(id, status);
      setIssues(issues.map(issue => issue.id === id ? { ...issue, status } : issue));
      toast({
        title: 'Success!',
        description: 'Issue status has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update issue status.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
        try {
            await deleteIssue(id);
            setIssues(issues.filter(issue => issue.id !== id));
            toast({
                title: 'Success!',
                description: 'Issue has been deleted.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete issue.',
            });
        }
    }
  };


  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">All Issues</h1>
      </div>
      <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Photo</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Reported By</TableHead>
                {userIsAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <div className="font-medium">{issue.location}</div>
                    <div className="text-sm text-muted-foreground">
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
                      <span className="text-xs text-muted-foreground">No photo</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      {iconMap[issue.type]}
                      {issue.type}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant={statusVariant[issue.status]}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{issue.date}</TableCell>
                  <TableCell className="hidden md:table-cell">{issue.reportedBy}</TableCell>
                   {userIsAdmin && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleStatusChange(issue.id, 'Reported')}>
                            Set as Reported
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(issue.id, 'In Progress')}>
                            Set as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(issue.id, 'Resolved')}>
                            Set as Resolved
                          </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem className="text-red-500" onSelect={() => handleDelete(issue.id)}>
                            Delete Issue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
