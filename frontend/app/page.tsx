"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContextUploader } from "@/components/context-uploader"
import { ContextChat } from "@/components/context-chat"

export default function HomePage() {
  const [context, setContext] = useState<string>("")

  const contextPreview = useMemo(() => {
    if (!context) return ""
    const max = 400
    return context.length > max ? context.slice(0, max) + "…" : context
  }, [context])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-balance">Context-grounded Chat</h1>
        <p className="text-sm text-muted-foreground mt-2 text-pretty">
          Section 1: add your content (files, URL, or paste), then submit. Section 2: chat grounded on that content.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Section 1: Provide Context</CardTitle>
            <CardDescription>
              Drag & drop files, fetch a URL, paste text, then submit to use it in chat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContextUploader onSubmit={(combined) => setContext(combined)} />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Section 2: Chat</CardTitle>
            <CardDescription>
              The assistant will answer using only the submitted context. If something isn&apos;t in the context, it
              will say it doesn&apos;t know.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3 bg-muted/30">
              <div className="text-xs font-medium mb-1">Current context (preview)</div>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground max-h-40 overflow-auto">
                {context ? contextPreview : "No context submitted yet."}
              </pre>
            </div>
            <ContextChat context={context} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
