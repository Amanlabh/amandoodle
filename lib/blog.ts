import { promises as fs } from "node:fs"
import path from "node:path"

export type BlogStatus = "draft" | "published"

export interface BlogPostSummary {
  slug: string
  title: string
  description: string
  fiveWordDescription: string
  date: string
  tags: string[]
  status: BlogStatus
}

export interface BlogPost extends BlogPostSummary {
  content: string
}

export interface CreateBlogPostInput {
  title: string
  slug?: string
  description: string
  date?: string
  tags?: string[]
  status: BlogStatus
  content: string
}

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog")
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DESCRIPTION_WORD_LIMIT = 5

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sanitizeLineValue(value: string) {
  return value.trim().replace(/^["']|["']$/g, "")
}

function parseTags(value: string | undefined) {
  if (!value) {
    return []
  }

  const cleaned = value.trim().replace(/^\[|\]$/g, "")
  return cleaned
    .split(",")
    .map((tag) => sanitizeLineValue(tag))
    .filter(Boolean)
}

function stripMdxToText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[[^\]]+\]\(([^)]+)\)/g, " ")
    .replace(/[#>*_\-\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function countWords(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  return words.length
}

export function ensureFiveWordDescription(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  return words.slice(0, DESCRIPTION_WORD_LIMIT).join(" ")
}

export function isExactlyFiveWords(value: string) {
  return countWords(value) === DESCRIPTION_WORD_LIMIT
}

function normalizeStatus(value: string | undefined): BlogStatus {
  return value === "published" ? "published" : "draft"
}

function normalizeDate(value: string | undefined) {
  if (value && DATE_REGEX.test(value.trim())) {
    return value.trim()
  }

  return new Date().toISOString().slice(0, 10)
}

async function ensureBlogDirectory() {
  await fs.mkdir(BLOG_DIRECTORY, { recursive: true })
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function parseMdxFile(raw: string, slug: string): BlogPost {
  const match = raw.match(FRONTMATTER_REGEX)

  if (!match) {
    const fallbackDescription = ensureFiveWordDescription(stripMdxToText(raw))
    return {
      slug,
      title: slug.replace(/-/g, " "),
      description: fallbackDescription,
      fiveWordDescription: fallbackDescription,
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      status: "draft",
      content: raw.trim(),
    }
  }

  const [, rawFrontmatter, content] = match
  const lines = rawFrontmatter.split(/\r?\n/)
  const frontmatter: Record<string, string> = {}

  for (const line of lines) {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase()
    const value = line.slice(separatorIndex + 1).trim()
    frontmatter[key] = value
  }

  const title = sanitizeLineValue(frontmatter.title ?? slug.replace(/-/g, " ").trim())
  const descriptionSource =
    sanitizeLineValue(frontmatter.description ?? "") || stripMdxToText(content).trim()
  const fiveWordDescription = ensureFiveWordDescription(descriptionSource)

  return {
    slug,
    title,
    description: descriptionSource,
    fiveWordDescription,
    date: normalizeDate(frontmatter.date),
    tags: parseTags(frontmatter.tags),
    status: normalizeStatus(sanitizeLineValue(frontmatter.status)),
    content: content.trim(),
  }
}

function serializeFrontmatterValue(value: string) {
  const escaped = value.replace(/"/g, '\\"')
  return `"${escaped}"`
}

function buildMdxDocument(input: Omit<CreateBlogPostInput, "slug">) {
  const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean)
  const document = [
    "---",
    `title: ${serializeFrontmatterValue(input.title.trim())}`,
    `description: ${serializeFrontmatterValue(input.description.trim())}`,
    `date: ${normalizeDate(input.date)}`,
    `status: ${input.status}`,
    `tags: ${tags.join(", ")}`,
    "---",
    "",
    input.content.trim(),
    "",
  ]

  return document.join("\n")
}

export async function getAllBlogPosts(includeDrafts = false): Promise<BlogPostSummary[]> {
  await ensureBlogDirectory()
  const entries = await fs.readdir(BLOG_DIRECTORY, { withFileTypes: true })
  const posts: BlogPostSummary[] = []

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
      continue
    }

    const slug = entry.name.replace(/\.mdx$/, "")
    const filePath = path.join(BLOG_DIRECTORY, entry.name)
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = parseMdxFile(raw, slug)

    if (!includeDrafts && parsed.status !== "published") {
      continue
    }

    posts.push({
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      fiveWordDescription: parsed.fiveWordDescription,
      date: parsed.date,
      tags: parsed.tags,
      status: parsed.status,
    })
  }

  posts.sort((left, right) => right.date.localeCompare(left.date))
  return posts
}

export async function getBlogPostBySlug(slug: string, includeDrafts = false): Promise<BlogPost | null> {
  const normalizedSlug = normalizeSlug(slug)
  if (!normalizedSlug) {
    return null
  }

  const filePath = path.join(BLOG_DIRECTORY, `${normalizedSlug}.mdx`)
  if (!(await fileExists(filePath))) {
    return null
  }

  const raw = await fs.readFile(filePath, "utf8")
  const parsed = parseMdxFile(raw, normalizedSlug)

  if (!includeDrafts && parsed.status !== "published") {
    return null
  }

  return parsed
}

export async function getRelatedBlogPosts(source: BlogPost, limit = 3): Promise<BlogPostSummary[]> {
  const posts = await getAllBlogPosts(false)
  const sourceTagSet = new Set(source.tags.map((tag) => tag.toLowerCase()))
  const candidates = posts.filter((post) => post.slug !== source.slug)

  const ranked = candidates
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => sourceTagSet.has(tag.toLowerCase())).length
      return { post, sharedTags }
    })
    .sort((left, right) => {
      if (right.sharedTags !== left.sharedTags) {
        return right.sharedTags - left.sharedTags
      }

      return right.post.date.localeCompare(left.post.date)
    })

  return ranked.slice(0, limit).map((entry) => entry.post)
}

export async function createBlogPost(input: CreateBlogPostInput) {
  const title = input.title.trim()
  const description = input.description.trim()
  const content = input.content.trim()
  const status = normalizeStatus(input.status)

  if (!title) {
    throw new Error("Title is required.")
  }

  if (!description) {
    throw new Error("Description is required.")
  }

  if (!isExactlyFiveWords(description)) {
    throw new Error("Description must have exactly 5 words.")
  }

  if (!content) {
    throw new Error("Content is required.")
  }

  await ensureBlogDirectory()

  const slugSeed = normalizeSlug(input.slug?.trim() || title)
  if (!slugSeed) {
    throw new Error("Slug is invalid. Use letters and numbers.")
  }

  let slug = slugSeed
  let counter = 1
  let filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`)

  while (await fileExists(filePath)) {
    counter += 1
    slug = `${slugSeed}-${counter}`
    filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`)
  }

  const mdxDocument = buildMdxDocument({
    title,
    description,
    date: input.date,
    tags: input.tags,
    status,
    content,
  })

  await fs.writeFile(filePath, mdxDocument, "utf8")

  return {
    slug,
    filePath,
  }
}
