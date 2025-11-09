
'use server';
/**
 * @fileOverview A Telugu chatbot flow that helps residents draft issue reports.
 *
 * - draftIssueReport - A function that takes a description of an issue and returns a drafted issue report.
 * - DraftIssueReportInput - The input type for the draftIssueReport function.
 * - DraftIssueReportOutput - The return type for the draftIssueReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftIssueReportInputSchema = z.string().describe('The description of the issue to report in Telugu, Tanglish (romanized Telugu), or a statement of intent to report an issue.');
export type DraftIssueReportInput = string;

const DraftIssueReportOutputSchema = z.string().describe('A well-drafted issue report in Telugu, or a prompt asking for more details.');
export type DraftIssueReportOutput = string;

export async function draftIssueReport(input: DraftIssueReportInput): Promise<DraftIssueReportOutput> {
  return draftIssueReportFlow(input);
}

const draftIssueReportPrompt = ai.definePrompt({
  name: 'draftIssueReportPrompt',
  input: {schema: DraftIssueReportInputSchema},
  output: {schema: DraftIssueReportOutputSchema},
  prompt: `You are an expert assistant for the Mana Ooru Mana Badyatha app, skilled in drafting effective issue reports in Telugu. Your primary goal is to help users create a clear report from their description.

  The user's input might be in pure Telugu, romanized Telugu (e.g., "nenu complaint cheyali"), or a mix of English and Telugu (Tanglish). You must be able to understand all of these variations.

  Analyze the user's input.

  1.  **If the user is describing a specific problem** (e.g., "మా వీధిలో చెత్త పేరుకుపోయింది" or "4/86 maa inti number pakkan panchayithi workers dust ni clean cheyyaledhu"), draft a clear and concise issue report in **proper Telugu script** suitable for submission to the local authorities. The output should only be the drafted report itself.

  2.  **If the user is only stating their intention to report an issue** (e.g., "నేను ఒక ఫిర్యాదు చేయాలనుకుంటున్నాను" or "I want to make a complaint") without providing details, respond by politely asking them to describe the problem in Telugu. Your response should be something like: "తప్పకుండా, దయచేసి మీరు ఎదుర్కొంటున్న సమస్యను వివరించగలరా?" ("Certainly, please can you describe the problem you are facing?").

  User Input:
  {{input}}`,
});

const draftIssueReportFlow = ai.defineFlow(
  {
    name: 'draftIssueReportFlow',
    inputSchema: DraftIssueReportInputSchema,
    outputSchema: DraftIssueReportOutputSchema,
  },
  async input => {
    const {text} = await draftIssueReportPrompt(input);
    return text!;
  }
);
