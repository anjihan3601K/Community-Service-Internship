'use server';

/**
 * @fileOverview A Telugu chatbot that provides summaries of cleanliness tips from experts.
 *
 * - summarizeCleanlinessTips - A function that summarizes the latest cleanliness tips from experts.
 * - SummarizeCleanlinessTipsInput - The input type for the summarizeCleanlinessTips function.
 * - SummarizeCleanlinessTipsOutput - The return type for the summarizeCleanlinessTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCleanlinessTipsInputSchema = z.object({
  expertTips: z
    .string()
    .describe('The latest cleanliness tips from experts.'),
});
export type SummarizeCleanlinessTipsInput = z.infer<
  typeof SummarizeCleanlinessTipsInputSchema
>;

const SummarizeCleanlinessTipsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the cleanliness tips in Telugu.'),
});
export type SummarizeCleanlinessTipsOutput = z.infer<
  typeof SummarizeCleanlinessTipsOutputSchema
>;

export async function summarizeCleanlinessTips(
  input: SummarizeCleanlinessTipsInput
): Promise<SummarizeCleanlinessTipsOutput> {
  return summarizeCleanlinessTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCleanlinessTipsPrompt',
  input: {schema: SummarizeCleanlinessTipsInputSchema},
  output: {schema: SummarizeCleanlinessTipsOutputSchema},
  prompt: `You are a helpful chatbot that summarizes cleanliness tips from experts in Telugu.

  Summarize the following cleanliness tips in Telugu:

  {{expertTips}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const summarizeCleanlinessTipsFlow = ai.defineFlow(
  {
    name: 'summarizeCleanlinessTipsFlow',
    inputSchema: SummarizeCleanlinessTipsInputSchema,
    outputSchema: SummarizeCleanlinessTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
