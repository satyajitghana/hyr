import { MockLanguageModelV3 } from "ai/test";
import { simulateReadableStream } from "ai/test";

type StreamChunk =
  | { type: "text-start"; id: string }
  | { type: "text-delta"; id: string; delta: string }
  | { type: "text-end"; id: string }
  | {
      type: "finish";
      finishReason: { unified: "stop"; raw: undefined };
      logprobs: undefined;
      usage: {
        inputTokens: {
          total: number;
          noCache: number;
          cacheRead: undefined;
          cacheWrite: undefined;
        };
        outputTokens: {
          total: number;
          text: number;
          reasoning: undefined;
        };
      };
    };

const defaultUsage = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 20,
    text: 20,
    reasoning: undefined,
  },
};

export function mockGenerateResponse(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    finishReason: { unified: "stop" as const, raw: undefined },
    usage: defaultUsage,
    warnings: [] as never[],
  };
}

export function mockStreamResponse(text: string, chunkSize = 40) {
  const chunks: StreamChunk[] = [];
  chunks.push({ type: "text-start", id: "text-1" });

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({
      type: "text-delta",
      id: "text-1",
      delta: text.slice(i, i + chunkSize),
    });
  }

  chunks.push({ type: "text-end", id: "text-1" });
  chunks.push({
    type: "finish",
    finishReason: { unified: "stop", raw: undefined },
    logprobs: undefined,
    usage: defaultUsage,
  });

  return {
    stream: simulateReadableStream({
      chunks,
      chunkDelayInMs: 20,
    }),
  };
}

export function createGenerateModel(data: unknown) {
  return new MockLanguageModelV3({
    doGenerate: async () => mockGenerateResponse(data),
    doStream: async () => mockStreamResponse(JSON.stringify(data)),
  });
}

export function createStreamModel(data: unknown) {
  const text = JSON.stringify(data);
  return new MockLanguageModelV3({
    doGenerate: async () => mockGenerateResponse(data),
    doStream: async () => mockStreamResponse(text),
  });
}
