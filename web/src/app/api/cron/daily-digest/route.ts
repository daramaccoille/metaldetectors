import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { agentReports, users } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { Resend } from 'resend';

export const runtime = 'edge';


export async function GET(req: Request) {
  // 1. Verify cron secret to prevent unauthorized execution
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // 2. Fetch the most recent date from the reports table
    const latestReport = await db.query.agentReports.findFirst({
      orderBy: [desc(agentReports.date)]
    });

    if (!latestReport) {
      return new NextResponse('No reports found to send.', { status: 200 });
    }

    const targetDate = latestReport.date; // e.g. "2026-05-04"

    // 3. Fetch all "complete" reports for that date
    const todaysReports = await db.query.agentReports.findMany({
      where: (reports, { and, eq }) => and(
        eq(reports.date, targetDate),
        eq(reports.stage, 'complete') // Only send the final synthesis
      )
    });

    if (todaysReports.length === 0) {
      return new NextResponse(`No 'complete' stage reports found for ${targetDate}`, { status: 200 });
    }

    // 4. Build a beautiful HTML email template matching the "Black Gold" theme
    let reportsHtml = '';
    for (const report of todaysReports) {
      // Basic markdown to HTML conversion for email purposes (strip heavy stuff or just render text)
      // Since email clients are picky, we keep it simple.
      const htmlContent = report.contentMd
        .replace(/\n\n/g, '<br><br>')
        .replace(/## (.*)/g, '<h2 style="color: #fde047; font-size: 1.25rem; margin-top: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem;">$1</h2>')
        .replace(/# (.*)/g, '<h1 style="color: #facc15; font-size: 1.5rem;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      reportsHtml += `
        <div style="margin-bottom: 2rem; padding: 1.5rem; background: #111; border: 1px solid #333; border-radius: 0.5rem;">
          <div style="background: rgba(234,179,8,0.2); color: #fde047; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 1rem;">
            ${report.metal}
          </div>
          <div style="color: #d1d5db; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            ${htmlContent}
          </div>
          <a href="https://metaldetectors.online/reports/${report.id}" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #eab308; color: #000; text-decoration: none; border-radius: 0.25rem; font-weight: 600;">View in Terminal</a>
        </div>
      `;
    }

    const emailHtml = `
      <div style="background: #000; padding: 2rem; font-family: sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #facc15; text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">Intelligence Terminal</h1>
          <p style="color: #9ca3af; text-align: center; margin-bottom: 2rem;">Daily Market Synthesis for ${targetDate}</p>
          ${reportsHtml}
          <div style="text-align: center; margin-top: 3rem; color: #6b7280; font-size: 0.75rem;">
            <p>You are receiving this because you have an active Pro subscription to Metal Detectors.</p>
            <a href="https://metaldetectors.online/reports" style="color: #eab308; text-decoration: none;">Manage Subscription</a>
          </div>
        </div>
      </div>
    `;

    // 5. Fetch all active user
    const activeuser = await db.query.users.findMany({
      where: eq(users.active, true)
    });

    if (activeuser.length === 0) {
      return new NextResponse('No active user to send to.', { status: 200 });
    }

    // 6. Blast emails using Resend REST API (no SDK needed - keeps edge bundle tiny)
    const emailsToSend = activeuser.map(sub => ({
      from: 'Intelligence Terminal <reports@metaldetectors.online>',
      to: [sub.email],
      subject: `Metal Detectors Daily Synthesis: ${targetDate}`,
      html: emailHtml,
    }));

    const resendRes = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify(emailsToSend)
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Error sending emails:', errText);
      return new NextResponse(`Error sending emails: ${errText}`, { status: 500 });
    }

    return new NextResponse(`Successfully sent ${emailsToSend.length} digests!`, { status: 200 });

  } catch (error: any) {
    console.error('Cron job failed:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
