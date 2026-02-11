import { generateRssFeed } from "@/lib/rss";

export function GET() {
  const xml = generateRssFeed();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
