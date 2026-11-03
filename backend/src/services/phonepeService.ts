import crypto from 'crypto';
import { config } from '../config/index.js';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface PhonePePayResponse {
  orderId?: string;
  state?: string;
  redirectUrl?: string;
  code?: string;
  message?: string;
}

interface PhonePeStatusResponse {
  orderId?: string;
  state?: string;
  amount?: number;
  code?: string;
  message?: string;
}

export class PhonePeError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = 'PhonePeError';
    this.status = status;
  }
}

let tokenCache: TokenCache | null = null;

const urls = () => {
  if (config.phonepe.env === 'production') {
    return {
      token: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
      pay: 'https://api.phonepe.com/apis/pg/checkout/v2/pay',
      status: (merchantOrderId: string) =>
        `https://api.phonepe.com/apis/pg/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`,
    };
  }

  return {
    token: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    pay: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
    status: (merchantOrderId: string) =>
      `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`,
  };
};

const isProduction = (): boolean => config.phonepe.env === 'production';

/** SANDBOX needs Client ID/Secret; PRODUCTION needs Merchant ID + API key. */
export const phonepeConfigured = (): boolean =>
  isProduction()
    ? Boolean(config.phonepe.merchantId && config.phonepe.apiKey)
    : Boolean(config.phonepe.clientId && config.phonepe.clientSecret && config.phonepe.clientVersion);

export const phonepeMissingConfigMessage = (): string =>
  isProduction()
    ? 'PhonePe production is not configured. Add PHONEPE_MERCHANT_ID and PHONEPE_API_KEY to backend/.env.local.'
    : 'PhonePe sandbox is not configured. Add PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET and PHONEPE_CLIENT_VERSION to backend/.env.local.';

// ---------- Production: PG V1 (API key + X-VERIFY checksum) ----------
const V1_HOST = 'https://api.phonepe.com/apis/hermes';

const v1Checksum = (base64Payload: string, path: string): string => {
  const hash = crypto
    .createHash('sha256')
    .update(`${base64Payload}${path}${config.phonepe.apiKey}`)
    .digest('hex');
  return `${hash}###${config.phonepe.keyIndex}`;
};

const createPaymentV1 = async (input: {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
}): Promise<{ orderId: string; redirectUrl: string; state: string }> => {
  const payload = {
    merchantId: config.phonepe.merchantId,
    merchantTransactionId: input.merchantOrderId,
    merchantUserId: `MUID-${input.merchantOrderId.replace(/[^A-Za-z0-9]/g, '').slice(0, 20)}`,
    amount: input.amountPaise,
    redirectUrl: input.redirectUrl,
    redirectMode: 'REDIRECT',
    paymentInstrument: { type: 'PAY_PAGE' },
  };
  const path = '/pg/v1/pay';
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const response = await fetch(`${V1_HOST}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-VERIFY': v1Checksum(base64, path) },
    body: JSON.stringify({ request: base64 }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
    data?: { instrumentResponse?: { redirectInfo?: { url?: string } } };
  };
  const redirectUrl = data.data?.instrumentResponse?.redirectInfo?.url;
  if (!response.ok || !redirectUrl) {
    throw new PhonePeError(data.message || data.code || 'Unable to create the PhonePe checkout', 502);
  }
  return { orderId: input.merchantOrderId, redirectUrl, state: 'PENDING' };
};

const getStatusV1 = async (
  merchantOrderId: string
): Promise<{ orderId: string; state: string; amount?: number }> => {
  const path = `/pg/v1/status/${config.phonepe.merchantId}/${encodeURIComponent(merchantOrderId)}`;
  const response = await fetch(`${V1_HOST}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-VERIFY': v1Checksum('', path),
      'X-MERCHANT-ID': config.phonepe.merchantId,
    },
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
    data?: { state?: string; amount?: number; transactionId?: string };
  };
  const code = (data.code || '').toUpperCase();
  const rawState = (data.data?.state || '').toUpperCase();
  // Map V1 codes to the same states the V2 flow uses (COMPLETED / FAILED / PENDING)
  let state = 'PENDING';
  if (code === 'PAYMENT_SUCCESS' || rawState === 'COMPLETED') state = 'COMPLETED';
  else if (['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'TIMED_OUT', 'PAYMENT_CANCELLED'].includes(code) || rawState === 'FAILED') state = 'FAILED';
  else if (!response.ok && code !== 'PAYMENT_PENDING') {
    throw new PhonePeError(data.message || 'Unable to check PhonePe payment status', 502);
  }
  return {
    orderId: data.data?.transactionId || merchantOrderId,
    state,
    ...(typeof data.data?.amount === 'number' ? { amount: data.data.amount } : {}),
  };
};

/** Reads the merchant order id from a PhonePe webhook body (V2 JSON or V1 base64 `response`). */
export const extractWebhookMerchantOrderId = (body: unknown): string => {
  const b = (body || {}) as { payload?: { merchantOrderId?: string }; merchantOrderId?: string; response?: string };
  if (typeof b.response === 'string') {
    try {
      const decoded = JSON.parse(Buffer.from(b.response, 'base64').toString('utf8')) as {
        data?: { merchantTransactionId?: string };
      };
      return String(decoded.data?.merchantTransactionId || '');
    } catch {
      return '';
    }
  }
  return String(b.payload?.merchantOrderId || b.merchantOrderId || '');
};

const readPhonePeError = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { message?: string; code?: string };
    return body.message || body.code || `PhonePe request failed (${response.status})`;
  } catch {
    return `PhonePe request failed (${response.status})`;
  }
};

const getAccessToken = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAt - 60 > now) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    client_id: config.phonepe.clientId,
    client_version: config.phonepe.clientVersion,
    client_secret: config.phonepe.clientSecret,
    grant_type: 'client_credentials',
  });

  const response = await fetch(urls().token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new PhonePeError(await readPhonePeError(response), 502);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_at?: number;
    token_type?: string;
  };

  if (!data.access_token) {
    throw new PhonePeError('PhonePe did not return an access token');
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: data.expires_at && data.expires_at > now ? data.expires_at : now + 300,
  };

  return data.access_token;
};

const createPaymentV2 = async (input: {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
  message: string;
}): Promise<{ orderId: string; redirectUrl: string; state: string }> => {
  const accessToken = await getAccessToken();
  const response = await fetch(urls().pay, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      merchantOrderId: input.merchantOrderId,
      amount: input.amountPaise,
      expireAfter: 1200,
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: input.message,
        merchantUrls: {
          redirectUrl: input.redirectUrl,
        },
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PhonePePayResponse;
  if (!response.ok || !data.redirectUrl || !data.orderId) {
    throw new PhonePeError(data.message || 'Unable to create the PhonePe checkout', 502);
  }

  return {
    orderId: data.orderId,
    redirectUrl: data.redirectUrl,
    state: data.state || 'PENDING',
  };
};

const getStatusV2 = async (
  merchantOrderId: string
): Promise<{ orderId: string; state: string; amount?: number }> => {
  const accessToken = await getAccessToken();
  const response = await fetch(urls().status(merchantOrderId), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${accessToken}`,
    },
  });

  const data = (await response.json().catch(() => ({}))) as PhonePeStatusResponse;
  if (!response.ok || !data.state) {
    throw new PhonePeError(data.message || 'Unable to check PhonePe payment status', 502);
  }

  return {
    orderId: data.orderId || '',
    state: data.state.toUpperCase(),
    ...(typeof data.amount === 'number' ? { amount: data.amount } : {}),
  };
};

// ---------- Public API: switches on PHONEPE_ENV ----------
export const createPhonePePayment = (input: {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
  message: string;
}): Promise<{ orderId: string; redirectUrl: string; state: string }> =>
  isProduction() ? createPaymentV1(input) : createPaymentV2(input);

export const getPhonePeOrderStatus = (
  merchantOrderId: string
): Promise<{ orderId: string; state: string; amount?: number }> =>
  isProduction() ? getStatusV1(merchantOrderId) : getStatusV2(merchantOrderId);
