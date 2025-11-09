
'use client';

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Phone } from "lucide-react";
import { SupportContact } from "@/lib/data";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { isAdmin, getSupportContacts, deleteSupportContact } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupportContactForm } from "@/components/support-contact-form";
import { useRouter } from "next/navigation";


export default function SupportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<SupportContact | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const adminStatus = await isAdmin(currentUser.email);
        setUserIsAdmin(adminStatus);
        if (!adminStatus) {
            router.push('/dashboard');
        }
      } else {
        setUserIsAdmin(false);
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchContacts() {
      const fetchedContacts = await getSupportContacts();
      setContacts(fetchedContacts);
    }
    fetchContacts();
  }, [open, userIsAdmin]); 

  const handleEdit = (contact: SupportContact) => {
    setSelectedContact(contact);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedContact(null);
    setOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this contact?")) {
      await deleteSupportContact(id);
      setContacts(contacts.filter(c => c.id !== id));
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Support Contacts</h1>
        {userIsAdmin && (
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" /> Add New Contact
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Manage Contacts</CardTitle>
            <CardDescription>Add, edit, or remove support contacts that appear in the support dialog.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.number}</p>
                        </div>
                    </div>
                    {userIsAdmin && (
                    <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(contact)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(contact.id)}><Trash className="h-4 w-4" /></Button>
                    </div>
                    )}
                </li>
                ))}
            </ul>
        </CardContent>
      </Card>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        <SupportContactForm contact={selectedContact} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
