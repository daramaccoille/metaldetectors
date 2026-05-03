import { auth } from "@/auth"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
export const runtime = 'edge';
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    // Basic security check to prevent directory traversal
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
        return new NextResponse("Invalid file requested", { status: 400 });
    }

    const filePath = path.join(process.cwd(), '..', 'reports', filename);

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filename.endsWith('.md')) contentType = 'text/markdown';

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
