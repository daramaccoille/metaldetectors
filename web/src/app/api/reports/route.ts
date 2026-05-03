import { auth } from "@/auth"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
    // 1. Verify Authentication
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Resolve the reports directory (MetalDetectors/reports)
    // process.cwd() is MetalDetectors/web, so we go up one level
    const reportsDir = path.join(process.cwd(), '..', 'reports'); 
    
    // Ensure the directory exists
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 3. Read the reports
    try {
        const files = fs.readdirSync(reportsDir);
        
        // Filter to only return actual reports (e.g., pdf or md)
        const reports = files.filter(f => f.endsWith('.pdf') || f.endsWith('.md')).map(file => {
            // Optional: Parse file name to extract Metal and Agent
            // Example name: "Gold_PortfolioManager.pdf"
            const nameWithoutExt = path.parse(file).name;
            const [metal, agent] = nameWithoutExt.split('_');
            
            return {
                filename: file,
                metal: metal || 'Unknown',
                agent: agent || 'Unknown',
                downloadUrl: `/api/reports/download?file=${file}`
            };
        });

        return NextResponse.json({ reports });
    } catch (error) {
        return NextResponse.json({ error: "Failed to read reports directory" }, { status: 500 });
    }
}
