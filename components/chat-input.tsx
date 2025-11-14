"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 w-full border-t bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
            <div className="flex w-full max-w-3xl mx-auto gap-2 p-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "flex-1 resize-none rounded-lg border border-zinc-300 dark:border-zinc-700",
                        "bg-white dark:bg-zinc-900 px-4 py-3 text-sm",
                        "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                        "focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "min-h-[44px] max-h-[200px]"
                    )}
                    style={{
                        height: "auto",
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                    }}
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="shrink-0"
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

