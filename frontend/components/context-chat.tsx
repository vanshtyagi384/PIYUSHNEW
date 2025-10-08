"use client"

import { useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function hashString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) (h = (h << 5) - h + s.charCodeAt(i)), (h |= 0)
  return String(h)
}

export function ContextChat({ context }: { context: string }) {
  const key = useMemo(() => "chat-" + hashString(context || ""), [context])

  const { messages, sendMessage, status } = useChat({
    key,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => ({ "x-context": context || "" }),
    }),
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="min-h-[240px] max-h-[420px] overflow-auto rounded-md border p-3 bg-background">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Submit context in Section 1, then ask a question here. The assistant will only use your submitted context.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="mb-3">
            <div className="text-xs text-muted-foreground">{m.role === "user" ? "You" : "Assistant"}</div>
            {m.parts.map((part, idx) => {
              if (part.type === "text") {
                return (
                  <div key={idx} className="whitespace-pre-wrap text-sm">
                    {part.text}
                  </div>
                )
              }
              return null
            })}
          </div>
        ))}
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget as HTMLFormElement & { message: HTMLInputElement }
          const value = form.message.value.trim()
          if (!value) return
          sendMessage({ text: value })
          form.reset()
        }}
      >
        <Input
          name="message"
          placeholder={context ? "Ask a question about your context…" : "Submit context first, then chat…"}
          disabled={status === "in_progress" || !context}
          aria-label="Chat message"
        />
        <Button type="submit" disabled={status === "in_progress" || !context}>
          Send
        </Button>
      </form>
      {status === "in_progress" && <div className="text-xs text-muted-foreground">Assistant is thinking…</div>}
    </div>
  )
}
