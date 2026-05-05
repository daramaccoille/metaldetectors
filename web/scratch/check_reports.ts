import 'dotenv/config';
import { db } from '../src/drizzle/db';
import { agentReports } from '../src/drizzle/schema';

async function main() {
    const targetId = '048be5a0-8e68-4d11-840d-1f3ac0e9dfc0';
    try {
        const report = await db.query.agentReports.findFirst({
            where: (reports, { eq }) => eq(reports.id, targetId)
        });
        console.log('TARGET REPORT:', JSON.stringify(report, null, 2));
        
        const count = await db.select().from(agentReports);
        console.log('TOTAL REPORTS IN DB:', count.length);
    } catch (e) {
        console.error('Error querying reports:', e);
    }
}

main();
