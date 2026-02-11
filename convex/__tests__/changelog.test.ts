import { describe, expect, it } from "vitest";
import schema from "../schema";

/**
 * Changelog & Blog test suite (F001-013).
 *
 * Tests schema for changelogSubscribers table and users.lastSeenChangelogDate.
 */

describe("F001-013: Blog & Changelog", () => {
  // ═══ Schema Tests ═══
  describe("schema — changelogSubscribers table", () => {
    it("should define the changelogSubscribers table", () => {
      expect(schema.tables.changelogSubscribers).toBeDefined();
    });

    it("should have a unique email field", () => {
      const table = schema.tables.changelogSubscribers;
      // convex-ents defines unique fields as indexes
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("email");
    });

    it("should have unsubscribeToken index", () => {
      const table = schema.tables.changelogSubscribers;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("unsubscribeToken");
    });
  });

  describe("schema — users.lastSeenChangelogDate", () => {
    it("should have lastSeenChangelogDate field on users table", () => {
      const table = schema.tables.users;
      expect(table).toBeDefined();
      // Verify the validator shape contains lastSeenChangelogDate
      const validatorStr = JSON.stringify(table.validator);
      expect(validatorStr).toContain("lastSeenChangelogDate");
    });
  });

  // ═══ Content Structure Tests ═══
  describe("content directory structure", () => {
    it("should have blog MDX files with valid frontmatter", async () => {
      const { getAllBlogPosts } = await import("../../lib/content");
      const posts = getAllBlogPosts();
      expect(posts.length).toBeGreaterThan(0);
      for (const post of posts) {
        expect(post.title).toBeTruthy();
        expect(post.date).toBeTruthy();
        expect(post.description).toBeTruthy();
        expect(post.slug).toBeTruthy();
        expect(post.content).toBeTruthy();
      }
    });

    it("should have changelog MDX files with valid frontmatter", async () => {
      const { getAllChangelogEntries } = await import("../../lib/content");
      const entries = getAllChangelogEntries();
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.title).toBeTruthy();
        expect(entry.date).toBeTruthy();
        expect(entry.description).toBeTruthy();
        expect(entry.slug).toBeTruthy();
        expect(entry.content).toBeTruthy();
      }
    });

    it("should sort blog posts newest first", async () => {
      const { getAllBlogPosts } = await import("../../lib/content");
      const posts = getAllBlogPosts();
      for (let i = 1; i < posts.length; i++) {
        const prevDate = new Date(posts[i - 1].date).getTime();
        const currDate = new Date(posts[i].date).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it("should sort changelog entries newest first", async () => {
      const { getAllChangelogEntries } = await import("../../lib/content");
      const entries = getAllChangelogEntries();
      for (let i = 1; i < entries.length; i++) {
        const prevDate = new Date(entries[i - 1].date).getTime();
        const currDate = new Date(entries[i].date).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it("should return latest changelog date", async () => {
      const { getLatestChangelogDate } = await import("../../lib/content");
      const date = getLatestChangelogDate();
      expect(date).toBeTruthy();
      expect(typeof date).toBe("string");
      // Should be a valid date string
      expect(new Date(date!).getTime()).not.toBeNaN();
    });
  });

  // ═══ RSS Feed Tests ═══
  describe("RSS feed generation", () => {
    it("should generate valid RSS XML for blog posts", async () => {
      const { generateRssFeed } = await import("../../lib/rss");
      const xml = generateRssFeed();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain("<rss");
      expect(xml).toContain("<channel>");
      expect(xml).toContain("<item>");
      expect(xml).toContain("<title>");
      expect(xml).toContain("<link>");
      expect(xml).toContain("<description>");
      expect(xml).toContain("<pubDate>");
      expect(xml).toContain("<guid>");
    });

    it("should include all blog posts in RSS feed", async () => {
      const { generateRssFeed } = await import("../../lib/rss");
      const { getAllBlogPosts } = await import("../../lib/content");
      const xml = generateRssFeed();
      const posts = getAllBlogPosts();
      for (const post of posts) {
        expect(xml).toContain(post.title);
      }
    });
  });

  // ═══ Unsubscribe Token Tests ═══
  describe("unsubscribe token generation", () => {
    it("should generate unique tokens", async () => {
      const { generateUnsubscribeToken } = await import("../../lib/changelog");
      const token1 = generateUnsubscribeToken();
      const token2 = generateUnsubscribeToken();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(20);
    });
  });
});
