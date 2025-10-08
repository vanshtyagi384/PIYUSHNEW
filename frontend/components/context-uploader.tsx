"use client"

import type React from "react"

import { useCallback, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Source = {
  id: string
  type: "file" | "url" | "paste"
  title: string
  text: string
}

function genId() {
  return Math.random().toString(36).slice(2)
}

const MAX_CONTEXT_CHARS = 15000

export function ContextUploader({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [sources, setSources] = useState<Source[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [url, setUrl] = useState("")
  const [paste, setPaste] = useState("")
  const [loadingUrl, setLoadingUrl] = useState(false)

  const dropRef = useRef<HTMLDivElement | null>(null)

  const totalChars = useMemo(() => sources.reduce((acc, s) => acc + s.text.length, 0), [sources])

  const addSource = (s: Source) => setSources((prev) => [s, ...prev])
  const removeSource = (id: string) => setSources((prev) => prev.filter((s) => s.id !== id))
  const clearAll = () => setSources([])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    for (const file of files) {
      // Only text-like files for simplicity.
      //if (!file.type.startsWith("text/") && !/\.(txt|md|csv|json)$/i.test(file.name)) continue
      const text = await file.text()
      addSource({
        id: genId(),
        type: "file",
        title: file.name,
        text,
      })
    }
  }, [])

  const handleFetchUrl = async () => {
    if (!url) return
    try {
      setLoadingUrl(true)
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error("Failed to fetch URL")
      const data = await res.json()
      addSource({
        id: genId(),
        type: "url",
        title: data.title || url,
        text: data.text || "",
      })
      setUrl("")
    } catch (e) {
      console.error("[v0] URL fetch error:", e)
      // Consider adding a toast here via hooks/use-toast if desired.
    } finally {
      setLoadingUrl(false)
    }
  }

  const handleAddPaste = () => {
    if (!paste.trim()) return
    addSource({
      id: genId(),
      type: "paste",
      title: "Pasted content",
      text: paste,
    })
    setPaste("")
  }

  const combinedText = useMemo(() => {
    const sep = "\n\n-----\n\n"
    const joined = sources.map((s) => `Source (${s.type}): ${s.title}\n\n${s.text}`).join(sep)
    return joined.length > MAX_CONTEXT_CHARS ? joined.slice(0, MAX_CONTEXT_CHARS) : joined
  }, [sources])

  return (
    <div className="space-y-6">
      <div
        ref={dropRef}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-md border border-dashed p-6 text-center transition-colors",
          isDragging ? "border-primary bg-muted/50" : "border-border bg-muted/20",
        )}
        aria-label="Drag and drop files here"
      >
        <div className="text-sm">Drag & drop text files here (.txt, .md, .csv, .json)</div>
        <div className="text-xs text-muted-foreground mt-1">Files are read locally for privacy</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Website URL"
        />
        <Button onClick={handleFetchUrl} disabled={!url || loadingUrl}>
          {loadingUrl ? "Fetching…" : "Fetch URL"}
        </Button>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Paste copied content here…"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          aria-label="Paste content"
        />
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleAddPaste} disabled={!paste.trim()}>
            Add pasted content
          </Button>
          <Button variant="ghost" onClick={clearAll} disabled={sources.length === 0}>
            Clear all
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Added sources</div>
            <div className="text-xs text-muted-foreground">
              {sources.length} item(s) • {totalChars.toLocaleString()} chars
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {sources.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2 rounded-md border p-2 bg-background">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.text.slice(0, 100).replace(/\s+/g, " ")}
                    {s.text.length > 100 ? "…" : ""}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSource(s.id)}
                  aria-label={`Remove ${s.title}`}
                >
                  Remove
                </Button>
              </li>
            ))}
            {sources.length === 0 && <li className="text-sm text-muted-foreground">No sources added yet.</li>}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Will submit up to {MAX_CONTEXT_CHARS.toLocaleString()} characters of combined context.
        </div>
        <Button onClick={() => onSubmit(combinedText)} >
          Submit Context
        </Button>
      </div>
    </div>
  )
}
