
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFundingProject, getTransactionsForProject, isAdmin } from '@/app/actions';
import type { FundingProject, Transaction } from '@/lib/data';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const [project, setProject] = useState<FundingProject | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const adminStatus = await isAdmin(currentUser.email);
        setUserIsAdmin(adminStatus);
        if (!adminStatus) {
            // Non-admins should not see this page
            router.push('/dashboard/funding');
        }
      } else {
        // Logged out users should not see this page
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);


  useEffect(() => {
    if (userIsAdmin && projectId) {
      async function fetchData() {
        setLoading(true);
        const [projectData, transactionsData] = await Promise.all([
          getFundingProject(projectId),
          getTransactionsForProject(projectId),
        ]);
        setProject(projectData);
        setTransactions(transactionsData);
        setLoading(false);
      }
      fetchData();
    }
  }, [projectId, userIsAdmin]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/funding">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold font-headline">Transaction History</h1>
            <p className="text-muted-foreground">For project: {project.title}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A complete record of all contributions made to this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contributor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No transactions found for this project yet.
                    </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.contributorName}</TableCell>
                    <TableCell>₹{tx.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                        <Badge variant={tx.paymentMethod === 'online' ? 'default' : 'secondary'}>{tx.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>{tx.date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
