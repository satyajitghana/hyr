import { generateText, Output } from "ai";
import {
  jobDetailsSchema,
  tailoredResumeSchema,
  coverLetterSchema,
  recruiterEmailSchema,
  resumeInputSchema,
  jobInputSchema,
} from "@/lib/ai/schemas";
import { createGenerateModel } from "@/lib/ai/model";
import {
  generateMockJobDetails,
  generateMockTailoredResume,
  generateMockCoverLetter,
  generateMockRecruiterEmail,
} from "@/lib/ai/mock-data-generators";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = resumeInputSchema.parse(body.resume);
  const job = jobInputSchema.parse(body.job);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Extract job details
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "extracting", progress: 0 })}\n\n`
          )
        );

        const jobDetailsMock = generateMockJobDetails(job.description);
        const jobDetailsModel = createGenerateModel(jobDetailsMock);
        const { output: jobDetails } = await generateText({
          model: jobDetailsModel,
          output: Output.object({ schema: jobDetailsSchema }),
          prompt: `Extract job details from: ${job.description}`,
        });

        // Step 2: Tailor resume
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "tailoring", progress: 25, jobDetails })}\n\n`
          )
        );

        const tailorMock = generateMockTailoredResume(
          resume,
          job.description,
          jobDetails?.title ?? job.title,
          jobDetails?.company ?? job.company
        );
        const tailorModel = createGenerateModel(tailorMock);
        const { output: tailored } = await generateText({
          model: tailorModel,
          output: Output.object({ schema: tailoredResumeSchema }),
          prompt: `Tailor resume for ${job.title} at ${job.company}`,
        });

        // Step 3: Cover letter
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "cover-letter", progress: 50, tailored })}\n\n`
          )
        );

        const coverMock = { content: generateMockCoverLetter(resume, job) };
        const coverModel = createGenerateModel(coverMock);
        const { output: coverLetterResult } = await generateText({
          model: coverModel,
          output: Output.object({ schema: coverLetterSchema }),
          prompt: `Write cover letter for ${job.title} at ${job.company}`,
        });

        // Step 4: Recruiter email
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "email", progress: 75, coverLetter: coverLetterResult?.content ?? "" })}\n\n`
          )
        );

        const emailMock = generateMockRecruiterEmail(resume, job);
        const emailModel = createGenerateModel(emailMock);
        const { output: recruiterEmail } = await generateText({
          model: emailModel,
          output: Output.object({ schema: recruiterEmailSchema }),
          prompt: `Write recruiter email for ${job.title} at ${job.company}`,
        });

        // Done
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "done", progress: 100, recruiterEmail })}\n\n`
          )
        );

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: "error", progress: 0, error: String(error) })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
