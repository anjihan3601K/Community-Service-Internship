
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contributeToProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { Loader2, QrCode } from "lucide-react";
import { FundingProject } from "@/lib/data";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User } from "firebase/auth";


const contributionSchema = z.object({
  amount: z.coerce.number().positive("Contribution must be a positive number."),
  paymentMethod: z.enum(['online', 'cash'], { required_error: "Please select a payment method."}),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton({ text, disabled }: { text: string, disabled?: boolean}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code-placeholder');


export function FundProjectDialog({ user, project, open, onOpenChange, onFormSuccess }: { user?: User | null, project: FundingProject, open: boolean, onOpenChange: (open: boolean) => void, onFormSuccess: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  
  const action = contributeToProject.bind(null, project.id);
  const [state, formAction] = useFormState(action, initialState);

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 100,
      paymentMethod: "online",
    },
  });
  
  useEffect(() => {
    // Reset state when dialog opens or project changes
    if (open) {
      setStep(1);
      form.reset({ amount: 100, paymentMethod: "online" });
    }
  }, [open, project, form]);


  useEffect(() => {
    if (state?.message) {
      const hasErrors = state.errors && Object.keys(state.errors).length > 0;
      if (!hasErrors) {
        setStep(3); // Go to success step
      } else {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        });
      }
    }
  }, [state, toast]);
  
  function onSubmit(data: ContributionFormValues) {
    setContributionAmount(data.amount);
    setPaymentMethod(data.paymentMethod);
    if (data.paymentMethod === 'online') {
        setStep(2);
    } else { // Cash
        const formData = new FormData();
        formData.append('amount', data.amount.toString());
        formData.append('paymentMethod', data.paymentMethod);
        formAction(formData);
    }
  }
  
  function handlePaymentConfirmed() {
    const formData = new FormData();
    formData.append('amount', contributionAmount.toString());
    formData.append('paymentMethod', paymentMethod);
    formAction(formData);
  }
  
  const handleDialogClose = () => {
    onOpenChange(false);
    if(step === 3) {
      onFormSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund "{project.title}"</DialogTitle>
          {step === 1 && <DialogDescription>{project.description}</DialogDescription>}
        </DialogHeader>

        {step === 1 && (
            <>
            <div className="space-y-2 my-4">
                <Progress value={(project.current / project.goal) * 100} />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Raised: ₹{project.current.toLocaleString('en-IN')}</span>
                    <span>Goal: ₹{project.goal.toLocaleString('en-IN')}</span>
                </div>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contribution Amount (₹)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="online" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Online Payment (PhonePe, GPay, etc.)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="cash" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Cash
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Proceed to Pay</Button>
            </form>
            </Form>
            </>
        )}

        {step === 2 && (
            <div className="flex flex-col items-center gap-4 text-center">
                <DialogDescription>
                    Please complete your payment of ₹{contributionAmount.toLocaleString('en-IN')} using the details below.
                </DialogDescription>
                
                <div className="font-mono text-lg font-semibold p-3 bg-muted rounded-md">
                    PhonePe / GPay: 9951943598
                </div>

                <div className="relative w-48 h-48">
                    <img src="https://picsum.photos/seed/qr-code/192/192" alt="QR Code for payment" width="192" height="192" className="object-contain" data-ai-hint="qr code" />
                </div>
                
                <form action={handlePaymentConfirmed} className="w-full">
                     <SubmitButton text="I Have Completed the Payment" />
                </form>

                 <Button variant="link" size="sm" onClick={() => setStep(1)}>Go Back</Button>
            </div>
        )}
        
        {step === 3 && (
             <div className="flex flex-col items-center gap-4 text-center py-8">
                <DialogTitle className="text-2xl">Thank You!</DialogTitle>
                <DialogDescription>
                   Your contribution of ₹{contributionAmount.toLocaleString('en-IN')} has been successfully recorded.
                </DialogDescription>
                <Button onClick={handleDialogClose} className="w-full">Done</Button>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
