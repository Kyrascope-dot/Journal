import { getSiteOrigin } from "@/lib/seo";

type PayPalLink = {
  href?: string;
  rel?: string;
  method?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: PayPalLink[];
};

export type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim()
  );
}

export function getPayPalClientId(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  if (!clientId) throw new Error("PAYPAL_CLIENT_ID is not configured.");
  return clientId;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Could not authenticate with PayPal.");
  }
  return data.access_token;
}

function formatPayPalAmount(amountMajor: number): string {
  return amountMajor.toFixed(2);
}

export async function createPayPalOrder(input: {
  planId: string;
  label: string;
  description: string;
  currency: "USD";
  amountMajor: number;
  userId: string;
  userEmail: string;
  registrationId: string | null;
  returnPath?: "/conferences/payment" | "/payments/test";
}): Promise<{ orderId: string; approveUrl: string; status: string | null }> {
  const token = await getPayPalAccessToken();
  const origin = getSiteOrigin();
  const returnPath = input.returnPath ?? "/conferences/payment";
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.planId,
          custom_id: input.userId,
          invoice_id: `GCR-${Date.now().toString(36)}`,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value: formatPayPalAmount(input.amountMajor),
          },
        },
      ],
      // Do not set payment_source here — let PayPal show all enabled payer methods
      // (PayPal balance, cards, etc.). Pre-setting payment_source.paypal can cause
      // currency mismatch errors for INR payers on USD orders.
      application_context: {
        brand_name: "Global Confluence Review",
        landing_page: "NO_PREFERENCE",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${origin}${returnPath}?paypal_return=1`,
        cancel_url: `${origin}${returnPath}?paypal_cancelled=1`,
      },
    }),
  });

  const data = (await response.json()) as PayPalOrderResponse & { message?: string };
  if (!response.ok || !data.id) {
    throw new Error(data.message ?? "Could not create PayPal order.");
  }

  const approveUrl = data.links?.find((link) =>
    link.rel === "approve" || link.rel === "payer-action"
  )?.href;
  if (!approveUrl) {
    throw new Error("PayPal approval link was not returned.");
  }

  return {
    orderId: data.id,
    approveUrl,
    status: data.status ?? null,
  };
}

export async function capturePayPalOrder(
  orderId: string
): Promise<{ captureId: string; status: string; raw: PayPalCaptureResponse }> {
  const token = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await response.json()) as PayPalCaptureResponse & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Could not capture PayPal payment.");
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture?.id) {
    throw new Error("PayPal capture ID was not returned.");
  }

  return {
    captureId: capture.id,
    status: capture.status ?? data.status ?? "COMPLETED",
    raw: data,
  };
}
