import React from "react"

interface MdxRendererProps {
  content: string
}

function renderInlineMarkdown(text: string) {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const tokens = text.split(tokenRegex).filter(Boolean)

  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {token.slice(1, -1)}
        </code>
      )
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-muted-foreground"
        >
          {linkMatch[1]}
        </a>
      )
    }

    return <React.Fragment key={index}>{token}</React.Fragment>
  })
}

export function MdxRenderer({ content }: MdxRendererProps) {
  const lines = content.split(/\r?\n/)
  const blocks: React.ReactNode[] = []

  let listItems: string[] = []
  let paragraphLines: string[] = []
  let codeLines: string[] = []
  let inCodeBlock = false

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return
    }

    const text = paragraphLines.join(" ").trim()
    if (text) {
      blocks.push(
        <p key={`paragraph-${blocks.length}`} className="leading-7 text-foreground/90">
          {renderInlineMarkdown(text)}
        </p>,
      )
    }
    paragraphLines = []
  }

  const flushList = () => {
    if (listItems.length === 0) {
      return
    }

    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-6 text-foreground/90">
        {listItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    )
    listItems = []
  }

  const flushCode = () => {
    if (codeLines.length === 0) {
      return
    }

    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className="overflow-x-auto rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>,
    )
    codeLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCode()
        inCodeBlock = false
      } else {
        flushParagraph()
        flushList()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph()
      flushList()
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="text-xl font-semibold tracking-tight">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>,
      )
      continue
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph()
      flushList()
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="text-2xl font-semibold tracking-tight">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>,
      )
      continue
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph()
      flushList()
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="text-3xl font-bold tracking-tight">
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>,
      )
      continue
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph()
      listItems.push(trimmed.slice(2))
      continue
    }

    if (listItems.length > 0) {
      flushList()
    }

    paragraphLines.push(trimmed)
  }

  flushParagraph()
  flushList()
  flushCode()

  return <div className="space-y-5">{blocks}</div>
}
