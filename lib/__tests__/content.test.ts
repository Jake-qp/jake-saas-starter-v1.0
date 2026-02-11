import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

// Mock process.cwd() for deterministic paths
vi.spyOn(process, "cwd").mockReturnValue("/mock-project");

import {
  getAllBlogPosts,
  getBlogPost,
  getAllChangelogEntries,
  getLatestChangelogDate,
} from "../content";

describe("content utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(process, "cwd").mockReturnValue("/mock-project");
  });

  describe("getAllBlogPosts", () => {
    it("returns empty array when blog directory does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      const posts = getAllBlogPosts();
      expect(posts).toEqual([]);
    });

    it("returns posts sorted by date (newest first)", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readdirSync").mockReturnValue([
        "old-post.mdx",
        "new-post.mdx",
      ] as unknown as fs.Dirent[]);
      vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
        const p = String(filePath);
        if (p.includes("old-post")) {
          return `---
title: Old Post
date: "2026-01-01"
description: An old post
author: Author A
---
Old content`;
        }
        return `---
title: New Post
date: "2026-02-01"
description: A new post
author: Author B
---
New content`;
      });

      const posts = getAllBlogPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].slug).toBe("new-post");
      expect(posts[0].title).toBe("New Post");
      expect(posts[0].date).toBe("2026-02-01");
      expect(posts[0].description).toBe("A new post");
      expect(posts[0].author).toBe("Author B");
      expect(posts[1].slug).toBe("old-post");
    });

    it("throws when frontmatter is missing required fields", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readdirSync").mockReturnValue([
        "bad.mdx",
      ] as unknown as fs.Dirent[]);
      vi.spyOn(fs, "readFileSync").mockReturnValue(`---
title: Bad Post
---
No date or description`);

      expect(() => getAllBlogPosts()).toThrow(
        "Missing required frontmatter in blog/bad.mdx: date, description",
      );
    });
  });

  describe("getBlogPost", () => {
    it("returns null when post does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      const post = getBlogPost("nonexistent");
      expect(post).toBeNull();
    });

    it("returns a single post by slug", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(`---
title: My Post
date: "2026-01-15"
description: A great post
---
Post content here`);

      const post = getBlogPost("my-post");
      expect(post).not.toBeNull();
      expect(post!.slug).toBe("my-post");
      expect(post!.title).toBe("My Post");
      expect(post!.date).toBe("2026-01-15");
      expect(post!.content).toContain("Post content here");
    });
  });

  describe("getAllChangelogEntries", () => {
    it("returns empty array when changelog directory does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      const entries = getAllChangelogEntries();
      expect(entries).toEqual([]);
    });

    it("returns entries sorted by date (newest first)", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readdirSync").mockReturnValue([
        "2026-01-01.mdx",
        "2026-02-01.mdx",
      ] as unknown as fs.Dirent[]);
      vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
        const p = String(filePath);
        if (p.includes("2026-01-01")) {
          return `---
title: January Update
date: "2026-01-01"
description: First update
---
January content`;
        }
        return `---
title: February Update
date: "2026-02-01"
description: Second update
---
February content`;
      });

      const entries = getAllChangelogEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].slug).toBe("2026-02-01");
      expect(entries[0].title).toBe("February Update");
      expect(entries[1].slug).toBe("2026-01-01");
    });
  });

  describe("getLatestChangelogDate", () => {
    it("returns null when no entries exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      expect(getLatestChangelogDate()).toBeNull();
    });

    it("returns the date of the newest entry", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readdirSync").mockReturnValue([
        "2026-01-01.mdx",
        "2026-02-10.mdx",
      ] as unknown as fs.Dirent[]);
      vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
        const p = String(filePath);
        if (p.includes("2026-01-01")) {
          return `---
title: Old
date: "2026-01-01"
description: Old entry
---
Content`;
        }
        return `---
title: Latest
date: "2026-02-10"
description: Latest entry
---
Content`;
      });

      expect(getLatestChangelogDate()).toBe("2026-02-10");
    });
  });
});
