
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reportIssueAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";


const issueSchema = z.object({
  description: z.string().min(10, "Please provide a more detailed description."),
  location: z.string().min(3, "Please specify a location."),
  photo: z.any().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;


const initialState: {
  message: string;
  errors?: {
    description?: string[];
    location?: string[];
  };
} = {
  message: "",
};


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Report Issue
    </Button>
  );
}

export function IssueReportForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(reportIssueAction, initialState);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      description: "",
      location: "",
      photo: undefined,
    },
  });

  const photoRef = form.register("photo");

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({
        title: "Success!",
        description: state.message,
      });
      setOpen(false);
      form.reset();
      setFileName("");
    } else if (state?.errors) {
       Object.entries(state.errors).forEach(([key, value]) => {
         form.setError(key as keyof IssueFormValues, { message: value?.join(", ") });
       });
    }
  }, [state, toast, setOpen, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "No file chosen");
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Garbage pile near the temple"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Street corner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Upload Photo (Optional)</FormLabel>
            <FormControl>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                        {fileName || "No file chosen"}
                    </span>
                    <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        {...photoRef}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
            </FormControl>
            <FormDescription>A picture helps us understand the issue better.</FormDescription>
            <FormMessage />
        </FormItem>
        <SubmitButton />
      </form>
    </Form>
  );
}
