import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMdxSource } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Cookie Policy - SaaS Starter",
  description: "Cookie Policy for SaaS Starter.",
};

export default function CookiesPage() {
  const source = getMdxSource("legal/cookies.mdx");
  return <MDXRemote source={source} />;
}
