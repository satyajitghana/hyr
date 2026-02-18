import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { jobDetailsSchema } from "@/lib/ai/schemas";
import { createGenerateModel } from "@/lib/ai/model";
import { generateMockJobDetails } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const { description } = await req.json();

  const mockData = generateMockJobDetails(description);
  const model = createGenerateModel(mockData);

  const { output } = await generateText({
    model,
    output: Output.object({ schema: jobDetailsSchema }),
    prompt: `Extract the job title, company name, and relevant keywords from this job description:\n\n${description}`,
  });

  return NextResponse.json({ output });
}
