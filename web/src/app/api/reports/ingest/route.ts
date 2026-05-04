import { NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { agentReports } from "@/drizzle/schema"

export const runtime = 'edge';

export async function POST(request: Request) {
    // Basic API Key protection (User should set INGEST_API_KEY in .env)
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== (process.env.INGEST_API_KEY || "dev-secret-key")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        
        // Expecting an array of reports to batch insert
        if (!Array.isArray(body.reports)) {
            return new NextResponse("Invalid payload, expected { reports: [...] }", { status: 400 });
        }

        const reportsToInsert = body.reports.map((r: any) => ({
            reportBatchId: r.reportBatchId,
            metal: r.metal,
            date: r.date,
            stage: r.stage,
            agentName: r.agentName,
            contentMd: r.contentMd,
        }));

        await db.insert(agentReports).values(reportsToInsert);

        return NextResponse.json({ success: true, inserted: reportsToInsert.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
