import { config } from 'dotenv';
config({ path: '.env.local' }); // Load .env.local

import { db } from '../src/drizzle/db';
import { agentReports } from '../src/drizzle/schema';

async function main() {
    console.log("Wiping all existing agent reports to prevent duplicates...");
    await db.delete(agentReports);
    console.log("Successfully wiped agentReports table!");
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
