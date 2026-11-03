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

export const phonepeConfigured = (): boolean =>
  Boolean(config.phonepe.clientId && config.phonepe.clientSecret && config.phonepe.clientVersion);

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

export const createPhonePePayment = async (input: {
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

export const getPhonePeOrderStatus = async (
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
