import { db } from '@/drizzle/db';
import { digests } from '@metaldetectors/shared';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const runtime = 'edge';

type Props = {
    params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { date } = await params;
    return {
        title: `Market Report: ${date} | MetalDetectors`,
        description: `Read the archived AI market analysis for ${date}.`,
    };
}

export default async function ArchiveDetailPage({ params }: Props) {
    const { date } = await params;

    const digest = await db.query.digests.findFirst({
        where: eq(digests.date, date)
    });

    if (!digest) return notFound();

    return (
        <div className="min-h-screen bg-neutral-900">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur sticky top-0 z-50">
                <Link href="/archive" className="text-gray-400 hover:text-white mb-0 no-underline">
                    ← Archive
                </Link>
                <span className="font-mono text-white/80">{date}</span>
                <Link href="/" className="text-primary hover:text-white text-sm font-bold no-underline">
                    Subscribe
                </Link>
            </div>

            <div className="flex justify-center p-4 md:p-8">
                <div className="bg-white text-black w-full max-w-[600px] rounded shadow-xl overflow-hidden min-h-[500px]">
                    <iframe
                        // Using srcDoc to isolate the email HTML styles
                        srcDoc={digest.contentHtml}
                        className="w-full h-[1200px] border-none"
                        title={`Digest ${date}`}
                    />
                </div>
            </div>
        </div>
    );
}
