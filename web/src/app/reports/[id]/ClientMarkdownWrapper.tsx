"use client";

import dynamic from "next/dynamic";

// Dynamically import the markdown viewer with SSR disabled.
// By doing this inside a Client Component wrapper, we comply with Next.js 14+ rules
// and prevent 'react-markdown' from bloating the Cloudflare Edge Worker bundle.
const MarkdownViewer = dynamic(() => import('./MarkdownViewer'), { 
    ssr: false,
    loading: () => <div style={{ color: '#9ca3af', padding: '2rem', textAlign: 'center' }}>Decrypting report...</div>
});

export default function ClientMarkdownWrapper({ content }: { content: string }) {
    return <MarkdownViewer content={content} />;
}
