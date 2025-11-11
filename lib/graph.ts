import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, BaseMessage } from "langchain";
import { generateQueryOrRespond, tools } from "./rag-utils";
import { generate, gradeDocuments, rewrite } from "./grade-docs";

// Create a ToolNode for the retriever
const toolNode = new ToolNode(tools);

export interface AgentState {
    messages: BaseMessage[];
}

// Helper function to determine if we should retrieve
function shouldRetrieve(state: AgentState) {
    const { messages } = state;
    const lastMessage = messages.at(-1);

    if (AIMessage.isInstance(lastMessage) && lastMessage?.tool_calls?.length) {
        return "retrieve";
    }
    return END;
}
const StateAnnotation = Annotation.Root({
    routing: Annotation<string>,
    messages: Annotation<BaseMessage[]>({
        reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
            if (Array.isArray(right)) {
                return left.concat(right);
            }
            return left.concat([right]);
        },
    }),
});

// Define the graph
const builder = new StateGraph(StateAnnotation)
    .addNode("generateQueryOrRespond", generateQueryOrRespond)
    .addNode("retrieve", toolNode)
    .addNode("gradeDocuments", gradeDocuments)
    .addNode("rewrite", rewrite)
    .addNode("generate", generate)
    // Add edges
    .addEdge(START, "generateQueryOrRespond")
    // Decide whether to retrieve
    .addConditionalEdges("generateQueryOrRespond", shouldRetrieve)
    .addEdge("retrieve", "gradeDocuments")
    // Edges taken after grading documents
    .addConditionalEdges(
        "gradeDocuments",
        (state) => {
            // Use the routing decision from the state
            return state.routing || "generate";
        }
    )
    .addEdge("generate", END)
    .addEdge("rewrite", "generateQueryOrRespond");

// Compile
const graph = builder.compile();

export {
    graph
}