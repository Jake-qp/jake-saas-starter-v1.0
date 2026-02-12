import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMdxSource, mdxOptions } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Terms of Service - SaaS Starter",
  description: "Terms of Service for SaaS Starter.",
};

export default function TermsPage() {
  const source = getMdxSource("legal/terms.mdx");
  return <MDXRemote source={source} options={mdxOptions} />;
}
