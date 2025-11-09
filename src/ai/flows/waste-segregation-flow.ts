
'use server';
/**
 * @fileOverview An AI flow that analyzes an image of waste and provides segregation guidance.
 *
 * - segregateWaste - A function that takes an image and returns waste classification and guidance.
 * - WasteSegregationInput - The input type for the segregateWaste function.
 * - WasteSegregationOutput - The return type for the segregateWaste function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WasteSegregationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of trash, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type WasteSegregationInput = z.infer<typeof WasteSegregationInputSchema>;

const WasteSegregationOutputSchema = z.object({
  report: z.string().describe('A detailed report of approximately 500 words about the waste, formatted in Markdown.'),
});
export type WasteSegregationOutput = z.infer<typeof WasteSegregationOutputSchema>;


export async function segregateWaste(input: WasteSegregationInput): Promise<WasteSegregationOutput> {
  return wasteSegregationFlow(input);
}


const wasteSegregationPrompt = ai.definePrompt({
  name: 'wasteSegregationPrompt',
  input: {schema: WasteSegregationInputSchema},
  output: {schema: WasteSegregationOutputSchema},
  prompt: `You are an expert in waste management and environmental science, creating a detailed report for the residents of Ramaraju Lanka village. Your task is to analyze the provided image of waste and generate a comprehensive report of about 500 words in Markdown format.

The report must be structured with the following sections, using Markdown for formatting (e.g., ### for headings):

### Waste Identification
- Identify the primary type of waste in the image (e.g., Organic Waste, Plastic, Paper, E-Waste, Hazardous).
- Briefly describe the specific items seen (e.g., "vegetable peels and leftover food," "plastic water bottles and bags").

### Correct Disposal Method
- Specify the correct color-coded bin for disposal (e.g., Green for Organic, Blue for Recyclable, Red/Black for Hazardous).
- Provide clear, actionable instructions for how to dispose of this waste in Ramaraju Lanka. For example, "Rinse the plastic containers before placing them in the blue bin." or "This is wet waste and should go in the green bin for composting."

### Environmental & Health Impacts
- Explain in detail the negative consequences if this type of waste is not disposed of correctly.
- For organic waste, discuss how it attracts pests, spreads diseases, and releases methane gas in landfills.
- For plastics, describe soil and water pollution, the danger to animals that might ingest it, and how long it takes to decompose.
- For hazardous waste, explain the risks of chemical contamination to soil, water, and human health.

### Tips for Reduction
- Offer practical and simple tips for how residents can reduce this specific type of waste.
- For organic waste, suggest home composting or planning meals to reduce leftovers.
- For plastic waste, recommend using reusable bags, water bottles, and containers.

- Ensure the language is simple, encouraging, and easy for everyone in the village to understand. Use both English and provide Telugu translations in parentheses where appropriate.

User's Photo:
{{media url=photoDataUri}}`,
});

const wasteSegregationFlow = ai.defineFlow(
  {
    name: 'wasteSegregationFlow',
    inputSchema: WasteSegregationInputSchema,
    outputSchema: WasteSegregationOutputSchema,
  },
  async input => {
    const {output} = await wasteSegregationPrompt(input);
    return output!;
  }
);
