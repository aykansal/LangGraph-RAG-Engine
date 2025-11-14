import { NextRequest } from "next/server";
import { HumanMessage, BaseMessage, AIMessage } from "@langchain/core/messages";
import { graph } from "@/lib/graph";

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();

        if (!message || typeof message !== 'string') {
            return new Response(
                JSON.stringify({ error: "Message is required and must be a string" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Convert history to BaseMessage instances
        const messageHistory: BaseMessage[] = Array.isArray(history)
            ? history.map((msg: { role: string; content: string }) => {
                if (msg.role === "user") {
                    return new HumanMessage(msg.content);
                } else if (msg.role === "assistant") {
                    return new AIMessage(msg.content);
                }
                return new HumanMessage(msg.content);
            })
            : [];

        // Add the current user message
        const messages = [...messageHistory, new HumanMessage(message)];

        const inputs = {
            messages,
        };

        // Create a readable stream for Server-Sent Events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let finalResponse = "";
                    let lastNodeOutput = "";

                    for await (const output of await graph.stream(inputs)) {
                        for (const [key, value] of Object.entries(output)) {
                            // Handle routing decisions in state
                            if (value && typeof value === 'object' && 'routing' in value) {
                                continue;
                            }

                            // Handle state objects with messages
                            const nodeOutput = value as { messages?: BaseMessage[] };
                            const outputMessages = nodeOutput.messages;

                            if (!outputMessages || outputMessages.length === 0) {
                                continue;
                            }

                            const lastMsg = outputMessages[outputMessages.length - 1];

                            // Only send AI messages (final responses) to the client
                            // Prioritize the "generate" node as it contains the final answer
                            if (AIMessage.isInstance(lastMsg) && lastMsg.content) {
                                const content = typeof lastMsg.content === 'string' 
                                    ? lastMsg.content 
                                    : JSON.stringify(lastMsg.content);

                                // Update final response, prioritizing "generate" node
                                if (key === "generate" || !finalResponse) {
                                    finalResponse = content;
                                }

                                // Send incremental updates for streaming effect
                                // Only send if content changed and it's from generate node or we haven't sent anything yet
                                if (content !== lastNodeOutput && (key === "generate" || !lastNodeOutput)) {
                                    const data = JSON.stringify({
                                        type: "message",
                                        content: content,
                                        node: key,
                                    });
                                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                                    lastNodeOutput = content;
                                }
                            }
                        }
                    }

                    // Send final message
                    const finalData = JSON.stringify({
                        type: "done",
                        content: finalResponse,
                    });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                    controller.close();
                } catch (error) {
                    const errorData = JSON.stringify({
                        type: "error",
                        error: error instanceof Error ? error.message : "Unknown error occurred",
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: error instanceof Error ? error.message : "Internal server error" 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
