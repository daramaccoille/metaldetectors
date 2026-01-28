
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
