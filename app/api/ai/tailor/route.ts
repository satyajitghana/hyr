import { streamText, Output } from "ai";
import { tailoredResumeSchema, resumeInputSchema } from "@/lib/ai/schemas";
import { createStreamModel } from "@/lib/ai/model";
import { generateMockTailoredResume } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = resumeInputSchema.parse(body.resume);
  const { jobDescription, jobTitle, company } = body;

  const mockData = generateMockTailoredResume(
    resume,
    jobDescription,
    jobTitle,
    company
  );
  const model = createStreamModel(mockData);

  const result = streamText({
    model,
    output: Output.object({ schema: tailoredResumeSchema }),
    prompt: `Tailor this resume for the ${jobTitle} position at ${company}. Job description: ${jobDescription}`,
  });

  return result.toTextStreamResponse();
}
