import fs from "fs";
import path from "path";
import remarkGfm from "remark-gfm";

/**
 * Read an MDX file from the content directory at build time.
 * Returns the raw MDX source string for use with next-mdx-remote.
 */
export function getMdxSource(relativePath: string): string {
  const fullPath = path.join(process.cwd(), "content", relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`MDX file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, "utf-8");
}

/** Shared MDX options for next-mdx-remote — enables GFM tables, strikethrough, etc. */
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};
