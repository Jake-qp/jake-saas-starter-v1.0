import { describe, it, expect } from "vitest";
import { getMdxSource } from "@/lib/mdx";

describe("getMdxSource", () => {
  it("reads terms.mdx successfully", () => {
    const source = getMdxSource("legal/terms.mdx");
    expect(source).toContain("# Terms of Service");
    expect(source).toContain("Acceptance of Terms");
  });

  it("reads privacy.mdx successfully", () => {
    const source = getMdxSource("legal/privacy.mdx");
    expect(source).toContain("# Privacy Policy");
    expect(source).toContain("Information We Collect");
  });

  it("reads cookies.mdx successfully", () => {
    const source = getMdxSource("legal/cookies.mdx");
    expect(source).toContain("# Cookie Policy");
    expect(source).toContain("What Are Cookies");
  });

  it("throws for missing MDX file", () => {
    expect(() => getMdxSource("nonexistent.mdx")).toThrow(
      "MDX file not found: nonexistent.mdx",
    );
  });
});
