import { db } from '@/drizzle/db';
import { subscribers, digests } from '@/drizzle/schema';
import { desc, count, eq } from 'drizzle-orm';
import Link from 'next/link';

export const runtime = 'edge';

export default async function AdminDashboard() {
    // Parallel data fetching
    const [stats, recentDigests, recentSubs] = await Promise.all([
        // 1. Stats
        (async () => {
            const totalSubs = await db.select({ count: count() }).from(subscribers);
            const activeSubs = await db.select({ count: count() }).from(subscribers).where(eq(subscribers.active, true));
            return {
                total: totalSubs[0].count,
                active: activeSubs[0].count
            };
        })(),

        // 2. Recent Digests
        db.select().from(digests).orderBy(desc(digests.date)).limit(5),

        // 3. Recent Subscribers
        db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(10)
    ]);

    return (
        <main className="main-layout min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto items-stretch">
            <div className="bg-ambience"><div className="orb" /></div>

            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
                    <p className="text-gray-400">System Status: <span className="text-green-400">ONLINE</span></p>
                </div>
                <Link href="/" className="btn-secondary text-sm">Return Home</Link>
            </header>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass p-6">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Subscribers</h3>
                    <div className="text-4xl font-bold text-primary">{stats.active}</div>
                    <div className="text-xs text-gray-500 mt-2">of {stats.total} total signups</div>
                </div>
                <div className="glass p-6">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Last Digest</h3>
                    <div className="text-2xl font-bold text-white">
                        {recentDigests[0]?.date || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Auto-generated via Worker</div>
                </div>
                <div className="glass p-6 flex flex-col justify-center items-start gap-3">
                    <button className="btn-secondary w-full text-xs opacity-50 cursor-not-allowed" disabled>
                        Trigger Manual Digest (Coming Soon)
                    </button>
                    <button className="btn-secondary w-full text-xs opacity-50 cursor-not-allowed" disabled>
                        Export CSV (Coming Soon)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RECENT SUBSCRIBERS */}
                <div className="glass p-6">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Recent Joiners</h2>
                    <div className="space-y-4">
                        {recentSubs.length === 0 ? (
                            <p className="text-gray-500 italic">No subscribers yet.</p>
                        ) : (
                            recentSubs.map(sub => (
                                <div key={sub.id} className="flex justify-between items-center text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{sub.email}</span>
                                        <span className="text-xs text-gray-500">{new Date(sub.createdAt || '').toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {sub.active ? 'PRO' : 'INACTIVE'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* DIGEST ARCHIVE */}
                <div className="glass p-6">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Archive Log</h2>
                    <div className="space-y-4">
                        {recentDigests.map(digest => (
                            <Link
                                key={digest.id}
                                href={`/archive/${digest.date}`}
                                className="flex justify-between items-center text-sm p-3 rounded hover:bg-white/5 transition border border-transparent hover:border-white/10"
                            >
                                <span className="text-white font-mono">{digest.date}</span>
                                <span className="text-gray-400">View Report →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
