import { streamText, Output } from "ai";
import {
  recruiterEmailSchema,
  resumeInputSchema,
  jobInputSchema,
} from "@/lib/ai/schemas";
import { createStreamModel } from "@/lib/ai/model";
import { generateMockRecruiterEmail } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = resumeInputSchema.parse(body.resume);
  const job = jobInputSchema.parse(body.job);

  const mockData = generateMockRecruiterEmail(resume, job);
  const model = createStreamModel(mockData);

  const result = streamText({
    model,
    output: Output.object({ schema: recruiterEmailSchema }),
    prompt: `Write a professional recruiter outreach email for the ${job.title} position at ${job.company}.`,
  });

  return result.toTextStreamResponse();
}
