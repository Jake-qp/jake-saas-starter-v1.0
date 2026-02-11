import fs from "fs";
import path from "path";

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
