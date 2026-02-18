import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { tailoredChangeSchema } from "@/lib/ai/schemas";
import { createGenerateModel } from "@/lib/ai/model";
import { generateMockRefinedChanges } from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const { prompt, currentChanges } = await req.json();

  const mockData = generateMockRefinedChanges(prompt, currentChanges);
  const model = createGenerateModel(mockData);

  const { output } = await generateText({
    model,
    output: Output.array({ element: tailoredChangeSchema }),
    prompt: `Refine these resume changes based on this instruction: "${prompt}"`,
  });

  return NextResponse.json({ output });
}
