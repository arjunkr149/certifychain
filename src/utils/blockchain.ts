import { Certificate } from '../types';

// Compute real SHA-256 hash using Web Crypto API
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate an 8 or 16-byte random hex string
export function randomHash(bytes = 8): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(bytes);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(16).substring(2, 2 + bytes * 2);
}

export function formatDate(d?: string): string {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return d;
  }
}

export function verifyChainIntegrity(certs: Certificate[]): {
  valid: boolean;
  brokenBlocks: number[];
  checkedCount: number;
} {
  const broken: number[] = [];
  for (let i = 1; i < certs.length; i++) {
    if (certs[i].prevHash !== certs[i - 1].hash) {
      broken.push(i + 1);
    }
  }
  return {
    valid: broken.length === 0,
    brokenBlocks: broken,
    checkedCount: certs.length,
  };
}
