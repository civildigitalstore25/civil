import { config } from '../config/index.js';

export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] ?? c,
  );

const BRAND = '#F5A623';
const siteUrl = () => config.frontendUrl.replace(/\/$/, '');
export type StatusEmailKind = 'Processing' | 'Completed' | 'Cancelled' | 'PaymentFailed';

/** Copy per meaningful status. Pending (and any no-op change) never sends an email. */
export const STATUS_EMAIL_COPY: Record<StatusEmailKind, { subject: string; title: string; intro: string; cta: string }> = {
  Processing: { subject: 'Your order is being processed', title: 'We are working on your order', intro: 'Good news! Your order {id} is now being processed. We will email you again as soon as it is completed.', cta: 'Track my order' },
  Completed: { subject: 'Your order is complete', title: 'Your order is complete', intro: 'Your order {id} has been completed. Your files are ready to download from your account.', cta: 'Go to my downloads' },
  Cancelled: { subject: 'Your order has been cancelled', title: 'Order cancelled', intro: 'Your order {id} has been cancelled. If you were charged, any eligible refund will be processed to your original payment method. If this was unexpected, please contact us.', cta: 'View my orders' },
  PaymentFailed: { subject: 'Your payment did not go through', title: 'Payment failed', intro: 'We could not confirm the payment for your order {id}, so no download has been unlocked. If money was deducted it is usually reversed automatically by your bank. You can place the order again any time.', cta: 'View my orders' },
};

export const inr = (n: number) => `&#8377;${Number(n || 0).toLocaleString('en-IN')}`;

/** Shared header (logo) + footer wrapper for every outgoing email. */
export const renderLayout = (opts: { title: string; preheader?: string; bodyHtml: string }): string => {
  const logo = config.emailLogoUrl || `${config.emailAssetBaseUrl || siteUrl()}/logo.png`;
  const year = new Date().getFullYear();
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(opts.preheader || opts.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="background:#0f172a;padding:20px 24px;text-align:center;border-bottom:4px solid ${BRAND};">
<a href="${escapeHtml(siteUrl())}"><img src="${escapeHtml(logo)}" alt="${escapeHtml(config.brevoSenderName)}" height="48" style="display:inline-block;height:48px;max-width:220px;border:0;color:#ffffff;font-size:20px;font-weight:bold;text-decoration:none;"></a>
</td></tr>
<tr><td style="padding:28px 24px;font-size:14px;line-height:1.6;">
<h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${escapeHtml(opts.title)}</h1>
${opts.bodyHtml}
</td></tr>
<tr><td style="background:#f8fafc;padding:18px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;">
<p style="margin:0 0 6px;"><strong>${escapeHtml(config.brevoSenderName)}</strong></p>
<p style="margin:0 0 6px;"><a href="${escapeHtml(siteUrl())}" style="color:${BRAND};text-decoration:none;">${escapeHtml(siteUrl().replace(/^https?:\/\//, ''))}</a> &middot; <a href="${escapeHtml(siteUrl())}/contact-us" style="color:${BRAND};text-decoration:none;">Contact us</a></p>
<p style="margin:0;">&copy; ${year} ${escapeHtml(config.brevoSenderName)}. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`;
};

export const button = (href: string, label: string) =>
  `<p style="margin:24px 0;text-align:center;"><a href="${escapeHtml(href)}" style="background:${BRAND};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px;display:inline-block;">${escapeHtml(label)}</a></p>`;

export interface EmailOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
  gst: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt?: Date | string;
}

export const orderTable = (order: EmailOrder): string => {
  const rows = order.items
    .map(
      (it) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(it.title)} &times; ${it.quantity}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${inr(it.price * it.quantity)}</td></tr>`,
    )
    .join('');
  const discount = order.couponDiscount
    ? `<tr><td style="padding:6px 8px;color:#059669;">Coupon ${escapeHtml(order.couponCode || '')}</td><td style="padding:6px 8px;text-align:right;color:#059669;">-${inr(order.couponDiscount)}</td></tr>`
    : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;font-size:13px;">
<tr style="background:#f8fafc;"><th align="left" style="padding:8px;">Item</th><th align="right" style="padding:8px;">Amount</th></tr>
${rows}
<tr><td style="padding:6px 8px;">Subtotal</td><td style="padding:6px 8px;text-align:right;">${inr(order.subtotal)}</td></tr>
${discount}
<tr><td style="padding:6px 8px;">GST (18%)</td><td style="padding:6px 8px;text-align:right;">${inr(order.gst)}</td></tr>
<tr><td style="padding:8px;font-weight:bold;border-top:1px solid #e2e8f0;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;border-top:1px solid #e2e8f0;color:${BRAND};">${inr(order.totalAmount)}</td></tr>
</table>`;
};

export const templates = {
  passwordReset: (name: string, resetUrl: string) => ({
    subject: `Reset your ${config.brevoSenderName} password`,
    html: renderLayout({
      title: 'Reset your password',
      bodyHtml: `<p>Hello ${escapeHtml(name)},</p><p>Use the secure button below to reset your password. The link expires in 30 minutes.</p>${button(resetUrl, 'Reset password')}<p style="font-size:12px;color:#64748b;">If the button does not work, paste this link into your browser:<br>${escapeHtml(resetUrl)}</p><p>If you did not request this change, you can ignore this email.</p>`,
    }),
  }),

  contactForm: (c: { name: string; email: string; phone?: string; subject?: string; message: string }) => ({
    subject: `New contact form message${c.subject ? `: ${c.subject}` : ''}`,
    html: renderLayout({
      title: 'New contact form message',
      bodyHtml: `<table role="presentation" cellpadding="6" style="font-size:13px;">
<tr><td><strong>Name</strong></td><td>${escapeHtml(c.name)}</td></tr>
<tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></td></tr>
<tr><td><strong>Phone</strong></td><td>${escapeHtml(c.phone || '-')}</td></tr>
<tr><td><strong>Subject</strong></td><td>${escapeHtml(c.subject || '-')}</td></tr></table>
<p style="margin-top:16px;"><strong>Message</strong></p><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;white-space:pre-wrap;">${escapeHtml(c.message)}</div>`,
    }),
  }),

  orderConfirmation: (o: EmailOrder) => ({
    subject: `Order confirmed - #${o.orderId}`,
    html: renderLayout({
      title: 'Thank you for your order!',
      preheader: `Your order #${o.orderId} is confirmed.`,
      bodyHtml: `<p>Hi ${escapeHtml(o.customerName)},</p><p>We have received your payment. Your order <strong>#${escapeHtml(o.orderId)}</strong> is confirmed and your downloads are ready in your account.</p>${orderTable(o)}${button(`${siteUrl()}/account/orders`, 'View my orders & downloads')}<p>Need help? Just reply to this email or contact us from our website.</p>`,
    }),
  }),

  adminOrderAlert: (o: EmailOrder) => ({
    subject: `New order received - #${o.orderId} (${inr(o.totalAmount).replace('&#8377;', 'Rs. ')})`,
    html: renderLayout({
      title: 'New order received',
      bodyHtml: `<p><strong>Order:</strong> #${escapeHtml(o.orderId)}<br><strong>Customer:</strong> ${escapeHtml(o.customerName)} (${escapeHtml(o.customerEmail)}${o.customerPhone ? `, ${escapeHtml(o.customerPhone)}` : ''})<br><strong>Payment:</strong> ${escapeHtml(o.paymentMethod || '-')} - ${escapeHtml(o.paymentStatus)}</p>${orderTable(o)}${button(`${siteUrl()}/admin/orders`, 'Open in admin panel')}`,
    }),
  }),

  /** Customer-facing status update. Only called for meaningful transitions (see STATUS_EMAIL_COPY). */
  orderStatusChanged: (o: EmailOrder, kind: StatusEmailKind) => {
    const c = STATUS_EMAIL_COPY[kind];
    return {
      subject: `${c.subject} - order #${o.orderId}`,
      html: renderLayout({
        title: c.title,
        preheader: c.subject,
        bodyHtml: `<p>Hi ${escapeHtml(o.customerName)},</p><p>${c.intro.replace('{id}', `<strong>#${escapeHtml(o.orderId)}</strong>`)}</p>${orderTable(o)}${button(`${siteUrl()}/account/orders`, c.cta)}<p>Questions? Just reply to this email or <a href="${escapeHtml(siteUrl())}/contact-us" style="color:${BRAND};">contact us</a>.</p>`,
      }),
    };
  },
};