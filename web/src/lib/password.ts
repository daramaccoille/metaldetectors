// Edge-compatible password hashing using the Web Crypto API (PBKDF2)
// No bcryptjs needed - crypto.subtle is built into every Edge runtime.

const ITERATIONS = 100_000;
const HASH_ALGO = 'SHA-256';
const KEY_LEN = 32;

function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const hashBuf = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
        keyMaterial,
        KEY_LEN * 8
    );
    // Store as: pbkdf2$<salt_hex>$<hash_hex>
    return `pbkdf2$${bufToHex(salt.buffer)}$${bufToHex(hashBuf)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    // Support legacy bcrypt hashes during transition (they start with '$2')
    if (stored.startsWith('$2')) {
        // bcrypt hashes cannot be verified on edge - always fail safely
        // Users with old hashes will need to reset their password
        return false;
    }

    if (!stored.startsWith('pbkdf2$')) return false;

    const [, saltHex, hashHex] = stored.split('$');
    const salt = hexToBuf(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const hashBuf = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
        keyMaterial,
        KEY_LEN * 8
    );
    return bufToHex(hashBuf) === hashHex;
}
