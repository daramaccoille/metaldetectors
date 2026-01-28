
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export async function createCheckoutSession(
    secretKey: string,
    params: {
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        customerEmail?: string;
        customerId?: string;
        metadata?: Record<string, string>;
    }
) {
    const body = new URLSearchParams();
    body.append('mode', 'subscription');
    body.append('line_items[0][price]', params.priceId);
    body.append('line_items[0][quantity]', '1');
    body.append('success_url', params.successUrl);
    body.append('cancel_url', params.cancelUrl);

    if (params.customerId) {
        body.append('customer', params.customerId);
    } else if (params.customerEmail) {
        body.append('customer_email', params.customerEmail);
    }

    if (params.metadata) {
        Object.entries(params.metadata).forEach(([key, value]) => {
            body.append(`metadata[${key}]`, value);
        });
    }

    const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });

    if (!res.ok) {
        const error = await res.json() as any;
        throw new Error(error.error?.message || res.statusText);
    }

    return await res.json();
}

export async function createPortalSession(
    secretKey: string,
    customerId: string,
    returnUrl: string
) {
    const body = new URLSearchParams();
    body.append('customer', customerId);
    body.append('return_url', returnUrl);

    const res = await fetch(`${STRIPE_API_BASE}/billing_portal/sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });

    if (!res.ok) {
        const error = await res.json() as any;
        throw new Error(error.error?.message || res.statusText);
    }

    return await res.json();
}

// -------- Webhook Verification Utilities (Edge Compatible) --------

async function verifyStripeSignature(
    payload: string,
    sigHeader: string,
    secret: string
): Promise<any> {
    const timestamp = sigHeader.split(',').find(p => p.startsWith('t='))?.split('=')[1];
    const signature = sigHeader.split(',').find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !signature) {
        throw new Error('Missing timestamp or signature');
    }

    // Check timestamp to prevent replay attacks (tolerance 5 mins)
    if (Math.floor(Date.now() / 1000) - parseInt(timestamp) > 300) {
        throw new Error('Timestamp too old');
    }

    const signedPayload = `${timestamp}.${payload}`;

    // Import key for HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        hexToBytes(signature) as any,
        encoder.encode(signedPayload)
    );

    if (!isValid) {
        throw new Error('Invalid signature');
    }

    return JSON.parse(payload);
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export { verifyStripeSignature };
