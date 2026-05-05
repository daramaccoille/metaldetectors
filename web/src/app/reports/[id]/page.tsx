import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { agentReports, users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import ClientMarkdownWrapper from "./ClientMarkdownWrapper"

export const runtime = 'edge';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Enforce access control - verify active subscription
  if (session.user.email) {
    const subscriber = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });
    
    if (!subscriber?.active) {
      redirect("/#pricing");
    }
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
            <ClientMarkdownWrapper content={report.contentMd} />
          </div>
        </article>
      </div>
    </main>
  );
}
