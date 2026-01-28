
import { Resend } from 'resend';

export async function sendEmail(
    resendApiKey: string,
    to: string,
    subject: string,
    html: string
) {
    const resend = new Resend(resendApiKey);
    const from = 'metaldetectors@resend.dev'; // Only works if domain is verified or testing

    const content = {
        from,
        // For testing, Resend only allows sending to the verified email. 
        // In production, 'to' works.
        to,
        subject,
        html,
    };

    return resend.emails.send(content);
}
