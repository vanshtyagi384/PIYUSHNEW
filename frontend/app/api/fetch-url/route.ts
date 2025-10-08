export const maxDuration = 20

function sanitizeAndExtractText(html: string) {
  // remove scripts/styles
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
  // convert breaks/paras to newlines
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
  // strip all tags
  cleaned = cleaned.replace(/<[^>]+>/g, "")
  // decode basic HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  // normalize whitespace
  cleaned = cleaned
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return cleaned
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 })
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "v0-context-fetch/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: req.signal,
    })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch" }), { status: 502 })
    }
    const html = await res.text()
    const text = sanitizeAndExtractText(html)
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? sanitizeAndExtractText(titleMatch[1]) : undefined

    // limit size
    const MAX_CHARS = 12000
    const truncated = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text

    return Response.json({ title, text: truncated })
  } catch (e) {
    console.error("[v0] fetch-url error:", e)
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}
