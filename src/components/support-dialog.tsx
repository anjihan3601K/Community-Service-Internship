
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Phone, Loader2 } from 'lucide-react';
import { SupportContact } from '@/lib/data';
import { getSupportContacts } from '@/app/actions';

export function SupportDialog({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);
      const fetchedContacts = await getSupportContacts();
      setContacts(fetchedContacts);
      setLoading(false);
    }
    fetchContacts();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emergency & Support Contacts</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ul className="space-y-4">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between">
                  <span className="font-medium">{contact.name}</span>
                  <a
                    href={`tel:${contact.number}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{contact.number}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
