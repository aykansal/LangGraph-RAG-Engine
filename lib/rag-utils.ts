import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DistanceStrategy, PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";

const urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
];

export async function loadDocuments(urls: string[]) {
    const docs = await Promise.all(
        urls.map((url) => new CheerioWebBaseLoader(url).load()),
    );
    return docs;
}

// const postgresConnectionOptions = 
const retrieveSchema = z.object({ query: z.string() });

// pre-process documents
const docsList = (await loadDocuments(urls)).flat();
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
});
const docSplits = await textSplitter.splitDocuments(docsList);
console.log(`Split into ${docSplits.length} chunks.`);

// create retriever tools

const vectorStore = await PGVectorStore.fromDocuments(
    docSplits,
    new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey:process.env.GOOGLE_API_KEY,
    }),
    {
        postgresConnectionOptions: {
            type: "postgres",
            host: 'ep-solitary-hill-a1ncc89o-pooler.ap-southeast-1.aws.neon.tech',
            port: 5432,
            user: 'neondb_owner',
            password: process.env.PGPASSWORD!,
            database: 'neondb',
        },
        tableName: "testlangchainjs",
        distanceStrategy: "cosine" as DistanceStrategy,
    },
)

const retrieve = tool(
    async ({ query }) => {
        const retrievedDocs = await vectorStore.similaritySearch(query, 2);
        console.log(`Retrieved ${retrievedDocs.length} documents.`);
        const serialized = retrievedDocs
            .map(
                (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
            )
            .join("\n");
        return [serialized, retrievedDocs];
    },
    {
        name: "retrieve",
        description: "Retrieve information related to a query.",
        schema: retrieveSchema,
        responseFormat: "content_and_artifact",
    }
);
export const tools = [retrieve];

// @ts-expect-error TBD
export async function generateQueryOrRespond(state) {
    const { messages } = state;
    console.log('------------------')
    console.log(messages)
    console.log('------------------')

    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        temperature: 0,
    }).bindTools(tools);
    
    const response = await model.invoke(messages);
    console.log('------------------')
    console.log(response)
    console.log('------------------')
    return {
        messages: [response],
    };
}
