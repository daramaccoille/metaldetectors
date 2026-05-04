import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { agentReports } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

export const runtime = 'edge';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch the specific report
  const report = await db.query.agentReports.findFirst({
    where: eq(agentReports.id, params.id)
  });

  if (!report) {
    return (
      <main className="main-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="bg-ambience"></div>
        <div className="glass-panel text-center p-8">
          <h2 className="text-2xl text-red-400 mb-4">Report Not Found</h2>
          <Link href="/reports" className="btn-secondary">Return to Terminal</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-layout" style={{ justifyContent: 'flex-start', paddingTop: '6rem' }}>
      <div className="bg-ambience"></div>
      
      <div className="container" style={{ zIndex: 10, maxWidth: '800px', marginBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/reports" style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            &larr; Back to Terminal
          </Link>
        </div>

        <article className="glass-panel" style={{ padding: '3rem' }}>
          <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{report.metal}</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{report.date}</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>Stage: {report.stage}</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#fff', fontWeight: 700 }}>
              {report.agentName}
            </h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>
              Batch ID: {report.reportBatchId}
            </p>
          </header>

          <div className="markdown-body" style={{ color: '#d1d5db', lineHeight: 1.7, fontSize: '1.05rem' }}>
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
              {report.contentMd}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
