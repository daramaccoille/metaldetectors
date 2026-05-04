"use client"
import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  reportBatchId: string;
  metal: string;
  date: string;
  stage: string;
  agentName: string;
  contentMd: string;
}

interface Batch {
  batchId: string;
  metal: string;
  date: string;
  agents: Report[];
}

export default function ReportsClient({ reports, email }: { reports: Report[], email: string | null | undefined }) {
  const [selectedMetal, setSelectedMetal] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedAgent, setSelectedAgent] = useState<string>('All');

  // Helper to format 'bull.md' or 'complete_report.md' into 'Bull' or 'Complete Report'
  const formatAgentName = (name: string) => {
    return name
      .replace('.md', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Derive options
  const metals = ['All', ...Array.from(new Set(reports.map(r => r.metal)))];
  const dates = ['All', ...Array.from(new Set(reports.map(r => r.date)))];
  const stages = ['All', ...Array.from(new Set(reports.map(r => r.stage))).sort()];
  
  // Create a unique list of original agentNames to map over, but display nicely
  const rawAgents = Array.from(new Set(reports.map(r => r.agentName)));
  const agents = ['All', ...rawAgents];

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (selectedMetal !== 'All' && r.metal !== selectedMetal) return false;
      if (selectedDate !== 'All' && r.date !== selectedDate) return false;
      if (selectedStage !== 'All' && r.stage !== selectedStage) return false;
      if (selectedAgent !== 'All' && r.agentName !== selectedAgent) return false;
      return true;
    });
  }, [reports, selectedMetal, selectedDate, selectedStage, selectedAgent]);

  // Group filtered reports by batchId for nice display
  const grouped = filteredReports.reduce((acc, report) => {
    if (!acc[report.reportBatchId]) {
      acc[report.reportBatchId] = {
        batchId: report.reportBatchId,
        metal: report.metal,
        date: report.date,
        agents: []
      };
    }
    acc[report.reportBatchId].agents.push(report);
    return acc;
  }, {} as Record<string, Batch>);

  const batches = Object.values(grouped);

  // Styling helper
  const selectStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '0.875rem',
    cursor: 'pointer',
    minWidth: '150px'
  };

  return (
    <main className="main-layout" style={{ justifyContent: 'flex-start', paddingTop: '6rem' }}>
      <div className="bg-ambience"></div>
      
      <div className="container" style={{ zIndex: 10, maxWidth: '1000px' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: '1.5rem' }}>
          <div>
            <h1 className="hero-title" style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(to right, #fde047, #ca8a04)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Intelligence Terminal
            </h1>
            <p style={{ color: '#9ca3af', margin: '0.5rem 0 0 0' }}>Select and download your premium reports.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{email}</span>
             <form action="/api/auth/signout" method="POST">
                <button type="submit" style={{ padding: '0.5rem 1rem', background: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  Sign Out
                </button>
             </form>
          </div>
        </header>

        {/* Filters */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Metal</label>
            <select style={selectStyle} value={selectedMetal} onChange={e => setSelectedMetal(e.target.value)}>
              {metals.map(m => <option key={m} value={m} style={{ background: '#111' }}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</label>
            <select style={selectStyle} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
              {dates.map(d => <option key={d} value={d} style={{ background: '#111' }}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Stage</label>
            <select style={selectStyle} value={selectedStage} onChange={e => setSelectedStage(e.target.value)}>
              {stages.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Report Type</label>
            <select style={selectStyle} value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
              {agents.map(a => <option key={a} value={a} style={{ background: '#111' }}>{a === 'All' ? 'All' : formatAgentName(a)}</option>)}
            </select>
          </div>
          
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ color: '#eab308', fontSize: '0.875rem', fontWeight: 500 }}>
              Showing {filteredReports.length} results
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {batches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
               <p style={{ color: '#9ca3af' }}>No reports match your selected filters.</p>
            </div>
          ) : (
            batches.map((batch: Batch) => (
              <div key={batch.batchId} className="glass-panel glass-panel-hover" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <div>
                     <h3 style={{ color: '#eab308', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{batch.metal} Full Intelligence</h3>
                     <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>{batch.date} • Batch ID: {batch.batchId}</p>
                   </div>
                   <button className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                     Download All (.zip)
                   </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                   {batch.agents.map((agent: Report) => (
                     <div key={agent.id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{agent.stage}</span>
                       <h4 style={{ color: '#facc15', margin: '0 0 1rem 0', fontSize: '1.125rem' }}>{formatAgentName(agent.agentName)}</h4>
                       
                       <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem' }}>
                         <Link href={`/reports/${agent.id}`} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.875rem', transition: 'background 0.2s' }}>
                           Read
                         </Link>
                         <a href={`/api/reports/download?id=${agent.id}`} download style={{ flex: 1, padding: '0.5rem', background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.2s', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                           .MD
                         </a>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
