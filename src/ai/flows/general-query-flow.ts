'use server';
/**
 * @fileOverview A general purpose chatbot for the Mana Ooru Mana Badyatha project.
 *
 * - generalQuery - A function that takes a user query and returns a helpful response.
 * - GeneralQueryInput - The input type for the generalQuery function.
 * - GeneralQueryOutput - The return type for the generalQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralQueryInputSchema = z.string().describe('The user\'s query in either English or Telugu.');
export type GeneralQueryInput = string;

const GeneralQueryOutputSchema = z.string().describe('A helpful response to the user\'s query.');
export type GeneralQueryOutput = string;

export async function generalQuery(input: GeneralQueryInput): Promise<GeneralQueryOutput> {
  return generalQueryFlow(input);
}

const generalQueryPrompt = ai.definePrompt({
  name: 'generalQueryPrompt',
  input: {schema: GeneralQueryInputSchema},
  output: {schema: GeneralQueryOutputSchema},
  prompt: `You are a helpful and versatile AI assistant for the "Mana Ooru Mana Badyatha" project. Your goal is to keep the village of Ramaraju Lanka, Andhra Pradesh, India clean and beautiful. You can understand and respond in English, Telugu, and romanized Telugu (Tanglish).

Your main task is to provide helpful information about the Mana Ooru Mana Badyatha project. Use the information below to answer user questions. If a user wants to report an issue, ask them to use the "Report Issue" button on the dashboard.

**Project Information:**
- **Objective**: To empower residents to report and resolve cleanliness issues in the village.
- **Features**:
  - Users can report issues like garbage piles or infrastructure problems.
  - Users can create an account and log in.
  - There is a community dashboard showing recent issues and stats.
  - Users can view and contribute to crowdfunding projects.
  - A chatbot (you!) is available for help.
- **Admin-only features**:
  - Admins can manage crowdfunding projects, update issue statuses, and manage emergency contacts.

**Cleanliness Tips you can share if asked:**
1. Segregate waste into wet and dry.
2. Do not throw garbage in open plots or drains.
3. Use community bins for disposal.
4. Start composting at home for wet waste.
5. Participate in community clean-up drives.

---
**User Query:**
{{{input}}}
`,
});

const generalQueryFlow = ai.defineFlow(
  {
    name: 'generalQueryFlow',
    inputSchema: GeneralQueryInputSchema,
    outputSchema: GeneralQueryOutputSchema,
  },
  async input => {
    const {text} = await generalQueryPrompt(input);
    return text!;
  }
);
