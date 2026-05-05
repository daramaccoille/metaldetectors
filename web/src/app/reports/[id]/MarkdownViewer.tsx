'use client';

import ReactMarkdown from "react-markdown"

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({node, ...props}) => <h1 style={{ color: '#facc15', marginTop: '2rem', marginBottom: '1rem', fontSize: '2rem', fontWeight: 700 }} {...props} />,
        h2: ({node, ...props}) => <h2 style={{ color: '#fde047', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }} {...props} />,
        h3: ({node, ...props}) => <h3 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 600 }} {...props} />,
        p: ({node, ...props}) => <p style={{ marginBottom: '1.25rem' }} {...props} />,
        ul: ({node, ...props}) => <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.5rem', listStyleType: 'disc' }} {...props} />,
        ol: ({node, ...props}) => <ol style={{ marginBottom: '1.25rem', paddingLeft: '1.5rem', listStyleType: 'decimal' }} {...props} />,
        li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
        strong: ({node, ...props}) => <strong style={{ color: '#fff', fontWeight: 700 }} {...props} />,
        blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #eab308', paddingLeft: '1rem', color: '#9ca3af', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '1rem' }} {...props} />,
        code: ({node, inline, ...props}: any) => inline 
            ? <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', color: '#fde047', fontSize: '0.875em' }} {...props} />
            : <pre style={{ background: '#000', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem' }}><code style={{ color: '#e5e7eb', fontSize: '0.875em' }} {...props} /></pre>
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
