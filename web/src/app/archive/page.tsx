import { db } from '@/drizzle/db';
import { digests } from '@metaldetectors/shared';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export const runtime = 'edge';

export default async function ArchivePage() {
    const allDigests = await db.select({
        id: digests.id,
        date: digests.date,
    })
        .from(digests)
        .orderBy(desc(digests.date));

    return (
        <main className="main-layout pt-24 text-center">
            <div className="bg-ambience"><div className="orb" /></div>

            <div className="container glass p-8">
                <h1 className="hero-title text-3xl mb-8">Signal Archive</h1>

                <div className="grid gap-4">
                    {allDigests.length === 0 ? (
                        <p className="text-gray-400">No signals archived yet. Be the first to receive tomorrow's.</p>
                    ) : (
                        allDigests.map(digest => (
                            <Link
                                key={digest.id}
                                href={`/archive/${digest.date}`}
                                className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10 text-left flex justify-between items-center"
                            >
                                <div>
                                    <div className="text-xl font-bold text-primary">{digest.date}</div>
                                    <div className="text-sm text-gray-400">Daily Market Analysis</div>
                                </div>
                                <div className="text-gray-500">→</div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="mt-12">
                    <Link href="/" className="btn-secondary">Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
