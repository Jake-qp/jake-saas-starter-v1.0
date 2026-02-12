import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMdxSource, mdxOptions } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Privacy Policy - SaaS Starter",
  description: "Privacy Policy for SaaS Starter.",
};

export default function PrivacyPage() {
  const source = getMdxSource("legal/privacy.mdx");
  return <MDXRemote source={source} options={mdxOptions} />;
}
