import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RAG Chat Assistant",
    template: "%s | RAG Chat Assistant",
  },
  description:
    "Chat with your documents using RAG (Retrieval Augmented Generation). Ask questions and get intelligent answers powered by LangGraph and vector search.",
  keywords: [
    "RAG",
    "Retrieval Augmented Generation",
    "Chat Assistant",
    "Document Q&A",
    "LangGraph",
    "Vector Search",
    "AI Chat",
    "Document Chat",
  ],
  authors: [
    {
      name: "Ayush Kansal",
      url: "https://aykansal.tech",
    },
  ],
  creator: "RAG Chat Assistant",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "RAG Chat Assistant",
    description:
      "Chat with your documents using RAG (Retrieval Augmented Generation)",
    siteName: "RAG Chat Assistant",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Chat Assistant",
    description:
      "Chat with your documents using RAG (Retrieval Augmented Generation)",
    creator: "@aykansal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
