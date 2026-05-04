import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { agentReports } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export const runtime = 'edge';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse("Invalid ID requested", { status: 400 });
    }

    const reportArray = await db.select().from(agentReports).where(eq(agentReports.id, id));
    if (reportArray.length === 0) {
        return new NextResponse("File not found", { status: 404 });
    }

    const report = reportArray[0];
    const filename = `${report.metal}_${report.stage}_${report.agentName}`;

    return new NextResponse(report.contentMd, {
        headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
