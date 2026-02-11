"use client";

import { api } from "@/convex/_generated/api";
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
import { SUPPORTED_AI_MODELS } from "@/lib/aiModels";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import {
  ChatBubbleIcon,
  PaperPlaneIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useChat } from "@ai-sdk/react";

export default function AIChatPage() {
  const team = useCurrentTeam();
  const [model, setModel] = useState("gpt-4o");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convex queries for persisted data
  const creditUsage = useQuery(
    api.ai.getCreditUsage,
    team ? { teamId: team._id } : "skip",
  );
  const savedMessages = useQuery(
    api.ai.listMessages,
    team ? { teamId: team._id } : "skip",
  );

  // Convex mutations for saving messages
  const saveUserMessage = useMutation(api.ai.saveUserMessage);
  const saveAssistantMessage = useMutation(api.ai.saveAssistantMessage);

  // Vercel AI SDK useChat for streaming
  const {
    messages: chatMessages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    api: "/api/ai/chat",
    body: { model, teamId: team?._id },
    onFinish: ({ message }) => {
      if (!team) return;
      // Extract text from message parts
      const text = message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
      // Save assistant response and track credits
      void saveAssistantMessage({
        teamId: team._id,
        content: text,
        model,
        // Approximate token count from character length (rough estimate)
        tokenCount: Math.ceil(text.length / 4),
      });
    },
    onError: (err) => {
      console.error("[AI Chat] Error:", err.message);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, savedMessages]);

  const selectedModel = SUPPORTED_AI_MODELS.find((m) => m.id === model);

  // Combine persisted messages with current chat session messages
  // If chatMessages has items, show those (they include current session);
  // otherwise show saved messages from Convex
  const displayMessages =
    chatMessages.length > 0
      ? chatMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.parts
            .filter(
              (p): p is { type: "text"; text: string } => p.type === "text",
            )
            .map((p) => p.text)
            .join(""),
        }))
      : (savedMessages ?? []).map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
        }));

  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading || !team) return;

      const text = input.trim();
      setInput("");

      // Save user message to Convex (auth + permission + entitlement + rate limit)
      // then send to AI for streaming
      void saveUserMessage({ teamId: team._id, content: text })
        .then(() => sendMessage({ text }))
        .catch((err: unknown) => {
          console.error("[AI Chat] Failed to save user message:", err);
        });
    },
    [input, isLoading, team, saveUserMessage, sendMessage],
  );

  if (!team) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col p-4">
      <PageHeader
        title="AI Chat"
        description="Chat with AI models using your team's credits"
        actions={
          <div className="flex items-center gap-3">
            {creditUsage && creditUsage.limit !== -1 && (
              <UsageMeter
                current={creditUsage.current}
                limit={creditUsage.limit}
                label="Credits"
                className="w-40"
              />
            )}
            {creditUsage && creditUsage.limit === -1 && (
              <span className="text-xs text-muted-foreground">
                Unlimited credits
              </span>
            )}
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_AI_MODELS.map((m) => (
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
        {displayMessages.length === 0 ? (
          <EmptyState
            icon={<ChatBubbleIcon className="h-12 w-12" />}
            title="Start a conversation"
            description="Send a message to begin chatting with AI. Your team's credits will be used based on the selected model."
            className="flex-1 border-0"
          />
        ) : (
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-6">
              {displayMessages.map((message) => (
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
              {isLoading &&
                displayMessages[displayMessages.length - 1]?.role ===
                  "user" && (
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

        {error && (
          <div className="border-t border-destructive bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {error.message}
          </div>
        )}

        <div className="border-t p-4">
          <form
            onSubmit={handleSubmit}
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
                  handleSubmit(e);
                }
              }}
            />
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => void stop()}
              >
                <StopIcon className="h-4 w-4" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <PaperPlaneIcon className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
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
