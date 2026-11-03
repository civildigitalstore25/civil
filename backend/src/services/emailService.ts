import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
import { templates, type EmailOrder, type StatusEmailKind } from './emailTemplates.js';

export { escapeHtml } from './emailTemplates.js';

interface Recipient {
  email: string;
  name?: string;
}

/** Low-level Brevo transactional send. Throws on failure. */
export const sendBrevoEmail = async (input: {
  to: Recipient[];
  subject: string;
  html: string;
  replyTo?: Recipient;
}): Promise<void> => {
  if (!config.brevoApiKey || !config.brevoSenderEmail) {
    throw new Error('Brevo email configuration is incomplete (BREVO_API_KEY / BREVO_SENDER_EMAIL)');
  }
  const response = await fetch(AUTH.brevoEndpoint, {
    method: 'POST',
    headers: { accept: 'application/json', 'api-key': config.brevoApiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { email: config.brevoSenderEmail, name: config.brevoSenderName },
      to: input.to.map((r) => (r.name ? r : { email: r.email })),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      subject: input.subject,
      htmlContent: input.html,
    }),
  });
  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { message?: string; code?: string };
      detail = body.message || body.code || '';
    } catch {
      /* ignore */
    }
    throw new Error(`Brevo rejected the email request with status ${response.status}${detail ? `: ${detail}` : ''}`);
  }
};

/** Fire-and-log wrapper: email problems must never break orders or payments. */
const safely = async (label: string, send: () => Promise<void>): Promise<boolean> => {
  try {
    await send();
    return true;
  } catch (error) {
    console.error(`[email] ${label} failed:`, error instanceof Error ? error.message : error);
    return false;
  }
};

interface PasswordResetEmail {
  recipientEmail: string;
  recipientName: string;
  resetUrl: string;
}

/** Throws on failure so the forgot-password endpoint can report it (existing behaviour). */
export const sendPasswordResetEmail = async ({ recipientEmail, recipientName, resetUrl }: PasswordResetEmail) => {
  const t = templates.passwordReset(recipientName, resetUrl);
  await sendBrevoEmail({ to: [{ email: recipientEmail, name: recipientName }], subject: t.subject, html: t.html });
};

/** Throws on failure so the contact endpoint can tell the visitor. */
export const sendContactFormEmail = async (c: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  const t = templates.contactForm(c);
  await sendBrevoEmail({
    to: [{ email: config.contactEmail, name: config.brevoSenderName }],
    replyTo: { email: c.email, name: c.name },
    subject: t.subject,
    html: t.html,
  });
};

export const sendOrderConfirmationEmail = (o: EmailOrder) =>
  safely(`order confirmation ${o.orderId}`, async () => {
    const t = templates.orderConfirmation(o);
    await sendBrevoEmail({ to: [{ email: o.customerEmail, name: o.customerName }], subject: t.subject, html: t.html });
  });

export const sendAdminOrderAlertEmail = (o: EmailOrder) =>
  safely(`admin order alert ${o.orderId}`, async () => {
    const t = templates.adminOrderAlert(o);
    await sendBrevoEmail({ to: [{ email: config.adminEmail }], subject: t.subject, html: t.html });
  });

/** Maps an order status change to an email kind, or null when no email should go out (no-op / Pending). */
export const statusEmailKind = (previousStatus: string | undefined, nextStatus: string): StatusEmailKind | null => {
  if (!nextStatus || previousStatus === nextStatus) return null;
  if (nextStatus === 'Processing' || nextStatus === 'Completed' || nextStatus === 'Cancelled') return nextStatus;
  return null; // 'Pending' and anything unknown are internal
};

export const sendOrderStatusEmail = (o: EmailOrder, kind: StatusEmailKind) =>
  safely(`order status ${kind} ${o.orderId}`, async () => {
    const t = templates.orderStatusChanged(o, kind);
    await sendBrevoEmail({ to: [{ email: o.customerEmail, name: o.customerName }], subject: t.subject, html: t.html });
  });