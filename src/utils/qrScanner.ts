import jsQR from 'jsqr';

export interface DecodedQRResult {
  raw: string;
  certNo?: string;
  student?: string;
  course?: string;
  hash?: string;
}

/**
 * Scans an image dataUrl or image element for embedded QR codes using jsQR.
 */
export async function scanQrCodeFromDataUrl(dataUrl: string): Promise<DecodedQRResult | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Limit max dimensions for fast and accurate scanning
        const maxDim = 1200;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data && code.data.trim()) {
          const raw = code.data.trim();
          const parsed = parseQRData(raw);
          resolve(parsed);
          return;
        }

        resolve(null);
      } catch (err) {
        console.warn('QR code scan error:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = dataUrl;
  });
}

/**
 * Parses QR payload format:
 * - pipe-separated: "CERT-2024-001234|Priya Sharma|B.Tech Computer Science|a3f1c9d2e8b74f5a"
 * - json string: {"no":"CERT-...","student":"..."}
 * - direct serial: "CERT-2024-001234"
 * - URL: "https://certifychain.app/verify?no=CERT-2024-001234"
 */
export function parseQRData(raw: string): DecodedQRResult {
  const clean = raw.trim();

  // 1. Pipe format (used by CertifyChain issue flow)
  if (clean.includes('|')) {
    const parts = clean.split('|').map(p => p.trim());
    return {
      raw: clean,
      certNo: parts[0] || undefined,
      student: parts[1] || undefined,
      course: parts[2] || undefined,
      hash: parts[3] || undefined,
    };
  }

  // 2. JSON format
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const obj = JSON.parse(clean);
      return {
        raw: clean,
        certNo: obj.no || obj.certNo || obj.certificateNumber || obj.id,
        student: obj.student || obj.name,
        course: obj.course || obj.degree,
        hash: obj.hash,
      };
    } catch {
      // ignore
    }
  }

  // 3. URL format
  if (clean.includes('no=') || clean.includes('cert=')) {
    try {
      const url = new URL(clean, 'https://certifychain.app');
      const paramNo = url.searchParams.get('no') || url.searchParams.get('cert');
      if (paramNo) {
        return {
          raw: clean,
          certNo: paramNo,
        };
      }
    } catch {
      // ignore
    }
  }

  // 4. Regex extraction for CERT-XXXX-XXXXXX
  const certMatch = clean.match(/CERT-[A-Z0-9-]+/i) || clean.match(/FAKE-[A-Z0-9-]+/i) || clean.match(/STU[A-Z0-9-]+/i);
  if (certMatch) {
    return {
      raw: clean,
      certNo: certMatch[0].toUpperCase(),
    };
  }

  // 5. Raw string fallback
  return {
    raw: clean,
    certNo: clean,
  };
}
