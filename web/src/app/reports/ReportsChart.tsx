"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Report {
  id: string;
  reportBatchId: string;
  metal: string;
  date: string;
  stage: string;
  agentName: string;
}

export default function ReportsChart({ reports, selectedMetal }: { reports: Report[], selectedMetal: string }) {
  
  const chartData = useMemo(() => {
    // Filter to only the selected metal if one is selected
    const relevantReports = selectedMetal === 'All' 
      ? reports 
      : reports.filter(r => r.metal === selectedMetal);

    // Group by date to count "Signal Activity"
    const countsByDate = relevantReports.reduce((acc, report) => {
      acc[report.date] = (acc[report.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date ascending
    const sortedData = Object.entries(countsByDate)
      .map(([date, count]) => ({ date, signals: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
      
    return sortedData;
  }, [reports, selectedMetal]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#eab308', margin: 0, fontSize: '1.25rem' }}>
          Signal Activity Volume {selectedMetal !== 'All' ? `(${selectedMetal})` : ''}
        </h3>
        <p style={{ color: '#9ca3af', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Tracking AI agent analysis output over time.
        </p>
      </div>
      
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val.split('-').slice(1).join('/')} // Convert 2026-05-04 to 05/04
            />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '0.5rem', color: '#fff' }}
                itemStyle={{ color: '#fde047' }}
            />
            <Area type="monotone" dataKey="signals" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorSignals)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
