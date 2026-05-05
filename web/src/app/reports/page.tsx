import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { agentReports, users } from "@/drizzle/schema"
import { desc, eq } from "drizzle-orm"
import ReportsClient from "./ReportsClient"

export const runtime = 'edge';

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user) {
    // Redirect unauthenticated users to login
    redirect("/api/auth/signin");
  }

  // Enforce access control - verify active subscription
  if (session.user.email) {
    const subscriber = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });
    
    if (!subscriber?.active) {
      // Redirect to home page or a specific subscription renewal page
      redirect("/#pricing");
    }
  }

  // Fetch all reports from Neon and order by newest
  const allReports = await db.select().from(agentReports).orderBy(desc(agentReports.createdAt));
  
  return (
    <ReportsClient reports={allReports} email={session.user.email || null} />
  )
}
