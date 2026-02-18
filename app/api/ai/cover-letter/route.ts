import { streamText, Output } from "ai";
import {
  coverLetterSchema,
  resumeInputSchema,
  jobInputSchema,
} from "@/lib/ai/schemas";
import { createStreamModel } from "@/lib/ai/model";
import { generateMockCoverLetter } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = resumeInputSchema.parse(body.resume);
  const job = jobInputSchema.parse(body.job);

  const coverLetterText = generateMockCoverLetter(resume, job);
  const mockData = { content: coverLetterText };
  const model = createStreamModel(mockData);

  const result = streamText({
    model,
    output: Output.object({ schema: coverLetterSchema }),
    prompt: `Write a professional cover letter for the ${job.title} position at ${job.company}.`,
  });

  return result.toTextStreamResponse();
}
