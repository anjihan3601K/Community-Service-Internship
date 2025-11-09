
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addProject, updateProject } from "@/app/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FundingProject } from "@/lib/data";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Please provide a more detailed description."),
  goal: z.coerce.number().positive("Goal must be a positive number."),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Update Project' : 'Add Project'}
    </Button>
  );
}

export function FundingForm({ project, onFormSuccess }: { project: FundingProject | null, onFormSuccess: () => void }) {
  const { toast } = useToast();
  
  const action = project ? updateProject.bind(null, project.id) : addProject;
  const [state, formAction] = useFormState(action, initialState);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      goal: project?.goal || 0,
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
        onFormSuccess();
      }
    }
  }, [state, toast, onFormSuccess]);
  
  useEffect(() => {
    form.reset({
      title: project?.title || "",
      description: project?.description || "",
      goal: project?.goal || 0,
    });
  }, [project, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Install New Streetlights" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the project goals and benefits" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Goal (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isEditing={!!project} />
      </form>
    </Form>
  );
}
