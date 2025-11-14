"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={cn(
                "flex w-full gap-3 px-4 py-4",
                isUser ? "bg-white dark:bg-black" : "bg-zinc-50 dark:bg-zinc-950"
            )}
        >
            <div className="flex w-full max-w-3xl mx-auto gap-3">
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                        isUser
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    )}
                >
                    {isUser ? "U" : "AI"}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {isUser ? "You" : "Assistant"}
                    </div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {content}
                        {isStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

