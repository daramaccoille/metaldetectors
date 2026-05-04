import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { agentReports } from "@/drizzle/schema"
import { desc } from "drizzle-orm"
import ReportsClient from "./ReportsClient"

export const runtime = 'edge';

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user) {
    // Redirect unauthenticated users to login
    redirect("/api/auth/signin");
  }

  // Fetch all reports from Neon and order by newest
  const allReports = await db.select().from(agentReports).orderBy(desc(agentReports.createdAt));
  
  return (
    <ReportsClient reports={allReports} email={session.user.email} />
  )
}
