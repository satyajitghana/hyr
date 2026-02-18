import { streamText, Output } from "ai";
import { atsScoreSchema, resumeInputSchema } from "@/lib/ai/schemas";
import { createStreamModel } from "@/lib/ai/model";
import { generateMockATSScore } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = resumeInputSchema.parse(body.resume);

  const mockData = generateMockATSScore(resume);
  const model = createStreamModel(mockData);

  const result = streamText({
    model,
    output: Output.object({ schema: atsScoreSchema }),
    prompt: `Analyze this resume for ATS compatibility and provide a detailed score with suggestions for improvement.`,
  });

  return result.toTextStreamResponse();
}
