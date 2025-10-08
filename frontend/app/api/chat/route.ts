import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Read context from client header (set by DefaultChatTransport in the chat component)
  const context = req.headers.get("x-context") || ""

  const systemMessage: UIMessage = {
    id: "ctx-system",
    role: "system",
    parts: [
      {
        type: "text",
        text:
          `You are a helpful assistant. Use ONLY the following user-provided context to answer.\n` +
          `If the answer is not present in the context, reply with "I don't know based on the provided context.".\n\n` +
          `Context:\n${context}`,
      },
    ],
  }

  const prompt = convertToModelMessages([systemMessage, ...messages])

  const result = streamText({
    model: "openai/gpt-5",
    prompt,
    abortSignal: req.signal,
    maxOutputTokens: 1200,
    temperature: 0.2,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
