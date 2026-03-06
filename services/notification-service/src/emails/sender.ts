import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.EMAIL_FROM_NAME || 'Your Store'} <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`;

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_resend_api_key_here') {
        console.log(`[Email] (MOCK) To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const result = await resend.emails.send({ from: FROM, to, subject, html });
        console.log(`[Email] Sent to ${to}: ${subject} — ID: ${result.data?.id}`);
    } catch (err) {
        console.error(`[Email] Failed to send to ${to}:`, err);
    }
};
