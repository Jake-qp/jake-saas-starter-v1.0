"use client";

import { PageHeader } from "@/components";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UsageMeter } from "@/components";
import { EmptyState } from "@/components";
import { cn } from "@/lib/utils";
import { ChatBubbleIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState, useRef, useEffect } from "react";

// ─── Mock data for Phase 2 visual validation ───────────────────
const MOCK_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", credits: 10 },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", credits: 2 },
  { id: "claude-sonnet-4-5-20250929", label: "Claude Sonnet", credits: 8 },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku", credits: 2 },
];

const MOCK_MESSAGES = [
  {
    id: "1",
    role: "user" as const,
    content: "Can you explain how our billing system works?",
  },
  {
    id: "2",
    role: "assistant" as const,
    content:
      "Your billing system uses a credit-based model with three tiers:\n\n1. **Free tier** — 100 AI credits per month, up to 3 team members\n2. **Pro tier** — 5,000 AI credits per month, up to 20 members\n3. **Enterprise** — Unlimited credits and members\n\nEach AI model costs a different number of credits per request. For example, GPT-4o costs 10 credits while GPT-4o Mini costs only 2 credits.\n\nCredits reset at the beginning of each calendar month. You can track your usage on the billing settings page.",
  },
  {
    id: "3",
    role: "user" as const,
    content: "What happens when I run out of credits?",
  },
  {
    id: "4",
    role: "assistant" as const,
    content:
      "When you run out of credits, you'll see a notification suggesting you upgrade your plan. You won't be able to send new AI messages until:\n\n- Your credits reset at the start of the next month, or\n- You upgrade to a higher tier with more credits\n\nYou can check your current usage at any time using the credit meter shown in the AI chat sidebar.",
  },
];

const MOCK_USAGE = { current: 42, limit: 100 };
// ────────────────────────────────────────────────────────────────

export default function AIChatPage() {
  const [messages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [isLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedModel = MOCK_MODELS.find((m) => m.id === model);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col p-4">
      <PageHeader
        title="AI Chat"
        description="Chat with AI models using your team's credits"
        actions={
          <div className="flex items-center gap-3">
            <UsageMeter
              current={MOCK_USAGE.current}
              limit={MOCK_USAGE.limit}
              label="Credits"
              className="w-40"
            />
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center justify-between gap-2">
                      {m.label}
                      <span className="text-xs text-muted-foreground">
                        {m.credits} credits
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-lg border bg-background">
        {messages.length === 0 ? (
          <EmptyState
            icon={<ChatBubbleIcon className="h-12 w-12" />}
            title="Start a conversation"
            description="Send a message to begin chatting with AI. Your team's credits will be used based on the selected model."
            className="flex-1 border-0"
          />
        ) : (
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {selectedModel?.label ?? "AI"}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3 text-sm">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      {selectedModel?.label ?? "AI"}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Mock - no action in Phase 2
            }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Mock - no action in Phase 2
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              <PaperPlaneIcon className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
            Using {selectedModel?.label} ({selectedModel?.credits} credits per
            message)
          </p>
        </div>
      </div>
    </div>
  );
}
