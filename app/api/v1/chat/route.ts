import { NextResponse } from "next/server";
import { HumanMessage, BaseMessage, AIMessage } from "@langchain/core/messages";
import { graph } from "@/lib/graph";

export async function GET() {
    const inputs = {
        messages: [
            new HumanMessage("What does Lilian Weng say about types of reward hacking?")
        ]
    };

    for await (const output of await graph.stream(inputs)) {
        for (const [key, value] of Object.entries(output)) {
            console.log('**********')
            console.log(key, value)
            console.log('**********')

            // Handle routing decisions in state
            if (value && typeof value === 'object' && 'routing' in value) {
                console.log(`Output from node: '${key}' - Routing decision: ${value.routing}`);
                console.log("---\n");
                continue;
            }

            // Handle state objects with messages
            const nodeOutput = value as { messages?: BaseMessage[] };
            const outputk = nodeOutput.messages;
            console.log('+++++++++++++++++')
            console.log(outputk)
            console.log('+++++++++++++++++')

            if (!outputk || outputk.length === 0) {
                console.log(`Output from node: '${key}' - No messages`);
                console.log("---\n");
                continue;
            }

            const lastMsg = outputk[outputk.length - 1];

            console.log(`Output from node: '${key}'`);

            console.log({
                type: lastMsg._getType(),
                content: lastMsg.content,
                tool_calls: AIMessage.isInstance(lastMsg) ? lastMsg.tool_calls : undefined,
            });

            console.log("---\n");
        }
    }


    return NextResponse.json({ status: "ok" });
}
