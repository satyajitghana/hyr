/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Pre-imports the PDF route so webpack compiles it at startup instead of on
 * the first user request (which would add ~5 s of compilation latency).
 * The route's module-level warmup IIFE then runs immediately, pre-loading
 * fonts and the bird image cache before any real PDF requests arrive.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./app/api/resume/pdf/route");
  }
}
