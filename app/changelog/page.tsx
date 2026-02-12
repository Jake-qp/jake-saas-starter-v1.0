import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllChangelogEntries } from "@/lib/content";
import { mdxOptions } from "@/lib/mdx";
import { PageHeader } from "@/components/PageHeader";
import { Separator } from "@/components/ui/separator";
import { ChangelogSubscribeForm } from "./ChangelogSubscribeForm";

export const metadata: Metadata = {
  title: "Changelog - SaaS Starter",
  description:
    "All the latest updates, improvements, and fixes to SaaS Starter.",
};

export default function ChangelogPage() {
  const entries = getAllChangelogEntries();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        title="Changelog"
        description="All the latest updates, improvements, and fixes."
      />

      <div className="mt-6">
        <ChangelogSubscribeForm />
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-lg">No changelog entries yet.</p>
          <p className="mt-2 text-sm">Check back soon for updates.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {entries.map((entry, index) => (
            <div key={entry.slug}>
              {index > 0 && <Separator className="mb-12" />}
              <div className="flex items-baseline gap-4">
                <time
                  dateTime={entry.date}
                  className="shrink-0 text-sm font-medium text-muted-foreground"
                >
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none prose-h1:text-2xl prose-h1:mt-0">
                <MDXRemote source={entry.content} options={mdxOptions} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
