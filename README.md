# LangGraph-RAG Engine

A chatbot that answers questions about AI and machine learning topics using advanced document retrieval and generation techniques.

## What It Does

This chatbot specializes in answering questions about concepts by searching through websites and providing accurate, context-aware responses.

```
     User Question
          ↓
   Analyze Question
          ↓
  ┌─────────────────┐
  │ Need Retrieval? │
  └─────────────────┘
          ↓
   ┌──────┴───────┐
   │              │
  YES            NO
   ↓              ↓
Retrieve      Generate
Documents      Direct
   ↓          Response
Grade Docs
   ↓
┌─────────────────┐
│ Docs Relevant?  │
└─────────────────┘
       ↓
┌──────┴──────┐
│             │
YES          NO
 ↓            ↓
Generate    Rewrite
Answer     Question
 ↓            ↓
└─────────────┘
       ↓
  Final Answer
```

## How It Works

The system uses a Retrieval-Augmented Generation (RAG) approach with these key building blocks:

1. **Question Analysis** (`generateQueryOrRespond`): Determines if information retrieval is needed and decides whether to use tools
2. **Document Retrieval** (`retrieve`): Searches through vectorized documents using semantic similarity to find relevant information
3. **Quality Assessment** (`gradeDocuments`): Evaluates retrieved documents for relevance to the user's question
4. **Query Refinement** (`rewrite`): Improves poorly performing queries by rephrasing them for better results
5. **Answer Generation** (`generate`): Creates concise, accurate responses using verified source material

Each block represents a specialized AI agent working together in a coordinated workflow managed by LangGraph.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI/ML**: Google Gemini 2.5 Flash, LangChain, LangGraph
- **Database**: PostgreSQL with PGVector for semantic search
- **Document Processing**: Cheerio for web scraping, Recursive text splitting

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (copy from `.env.example`):
```bash
pnpm run update:env
```

3. Run the development server:
```bash
pnpm dev
```