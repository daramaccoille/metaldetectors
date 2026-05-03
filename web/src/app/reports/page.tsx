import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { agentReports } from "@/drizzle/schema"
import { desc } from "drizzle-orm"

export const runtime = 'edge';

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user) {
    // Redirect unauthenticated users to login
    redirect("/api/auth/signin");
  }

  // Fetch all reports from Neon and order by newest
  const allReports = await db.select().from(agentReports).orderBy(desc(agentReports.createdAt));
  
  // Group the 5 agent reports into their "Full Report" batches
  const groupedReports = allReports.reduce((acc, report) => {
    if (!acc[report.reportBatchId]) {
      acc[report.reportBatchId] = {
        batchId: report.reportBatchId,
        metal: report.metal,
        date: report.createdAt,
        agents: []
      };
    }
    acc[report.reportBatchId].agents.push(report);
    return acc;
  }, {} as Record<string, any>);

  const batches = Object.values(groupedReports);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-yellow-500/20 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 text-transparent bg-clip-text">
              Metal Detectors
            </h1>
            <p className="text-gray-400 mt-2">Intelligence Reports Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-400">{session.user.email}</span>
             <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-sm px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 transition-colors">
                  Sign Out
                </button>
             </form>
          </div>
        </header>

        <div className="space-y-8">
          {batches.length === 0 ? (
            <div className="text-center py-12 border border-yellow-500/10 rounded-xl bg-gray-900/50">
               <p className="text-gray-400 text-lg">No reports found.</p>
               <p className="text-sm text-gray-500 mt-2">
                 Reports saved to your Neon database will appear here.
               </p>
            </div>
          ) : (
            batches.map((batch: any) => (
              <div key={batch.batchId} className="border border-yellow-500/20 bg-gray-900/40 rounded-xl p-6 hover:border-yellow-500/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="text-2xl font-semibold text-yellow-500 mb-1">{batch.metal} Full Report</h3>
                     <p className="text-gray-400 text-sm">Batch: <span className="font-mono text-xs">{batch.batchId}</span> • {new Date(batch.date).toLocaleString()}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {batch.agents.map((agent: any) => (
                     <div key={agent.id} className="bg-black/60 border border-gray-800 rounded-lg p-4 hover:border-yellow-500/30 transition-colors">
                       <h4 className="text-yellow-400 font-medium capitalize mb-2">{agent.agentName} Agent</h4>
                       <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                          {agent.contentMd.substring(0, 150)}...
                       </p>
                       <a href={`/reports/${agent.id}`} className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 font-semibold">
                         Read Report &rarr;
                       </a>
                     </div>
                   ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
