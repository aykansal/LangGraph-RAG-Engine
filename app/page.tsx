"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const handleSend = async (message: string) => {
        // Add user message immediately
        const userMessage: Message = { role: "user", content: message };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setStreamingContent("");

        try {
            const response = await fetch("/api/v1/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    history: messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body");
            }

            let buffer = "";
            let assistantMessage = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "message") {
                                assistantMessage = data.content;
                                setStreamingContent(data.content);
                            } else if (data.type === "done") {
                                assistantMessage = data.content || assistantMessage;
                                setStreamingContent("");
                                setMessages((prev) => [
                                    ...prev,
                                    { role: "assistant", content: assistantMessage },
                                ]);
                                setIsLoading(false);
                            } else if (data.type === "error") {
                                throw new Error(data.error || "Unknown error");
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
            setStreamingContent("");
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        RAG Chat Assistant
                    </h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Ask questions about the loaded documents
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                {messages.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full min-h-[60vh]">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                                Welcome to RAG Chat
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                                Start a conversation by asking a question about the documents.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-0">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            role={message.role}
                            content={message.content}
                        />
                    ))}
                    {isLoading && streamingContent && (
                        <ChatMessage
                            role="assistant"
                            content={streamingContent}
                            isStreaming={true}
                        />
                    )}
                    {isLoading && !streamingContent && (
                        <ChatMessage
                            role="assistant"
                            content="Thinking..."
                            isStreaming={true}
                        />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
    );
}
