
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addSupportContact, updateSupportContact } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { SupportContact } from "@/lib/data";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  number: z.string().min(3, "Please provide a valid number."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Update Contact' : 'Add Contact'}
    </Button>
  );
}

export function SupportContactForm({ contact, setOpen }: { contact: SupportContact | null, setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  
  const action = contact ? updateSupportContact.bind(null, contact.id) : addSupportContact;
  const [state, formAction] = useFormState(action, initialState);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name || "",
      number: contact?.number || "",
    },
  });

  useEffect(() => {
    if (state?.message) {
      const hasErrors = state.errors && Object.keys(state.errors).length > 0;
      toast({
        title: hasErrors ? "Error" : "Success!",
        description: state.message,
        variant: hasErrors ? "destructive" : "default",
      });
      if (!hasErrors) {
        setOpen(false);
      }
    }
  }, [state, toast, setOpen]);
  
  useEffect(() => {
    form.reset({
      name: contact?.name || "",
      number: contact?.number || "",
    });
  }, [contact, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Police Department" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="e.g., 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isEditing={!!contact} />
      </form>
    </Form>
  );
}
