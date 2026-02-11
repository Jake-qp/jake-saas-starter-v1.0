import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  author?: string;
  content: string;
}

export interface ChangelogEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Get all blog posts sorted by date (newest first).
 * Validates required frontmatter: title, date, description.
 */
export function getAllBlogPosts(): BlogPost[] {
  const blogDir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
      const { data, content } = matter(raw);

      validateFrontmatter(data, `blog/${file}`);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title as string,
        date: data.date as string,
        description: data.description as string,
        author: data.author as string | undefined,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug.
 */
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  validateFrontmatter(data, `blog/${slug}.mdx`);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    author: data.author as string | undefined,
    content,
  };
}

/**
 * Get all changelog entries sorted by date (newest first).
 * Validates required frontmatter: title, date, description.
 */
export function getAllChangelogEntries(): ChangelogEntry[] {
  const changelogDir = path.join(CONTENT_DIR, "changelog");
  if (!fs.existsSync(changelogDir)) return [];

  const files = fs.readdirSync(changelogDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(changelogDir, file), "utf-8");
      const { data, content } = matter(raw);

      validateFrontmatter(data, `changelog/${file}`);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title as string,
        date: data.date as string,
        description: data.description as string,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get the date of the most recent changelog entry (for WhatsNewBadge).
 */
export function getLatestChangelogDate(): string | null {
  const entries = getAllChangelogEntries();
  return entries.length > 0 ? entries[0].date : null;
}

/**
 * Validate that required frontmatter fields are present.
 * Throws at build time if any are missing.
 */
function validateFrontmatter(
  data: Record<string, unknown>,
  filePath: string,
): void {
  const required = ["title", "date", "description"];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required frontmatter in ${filePath}: ${missing.join(", ")}`,
    );
  }
}
