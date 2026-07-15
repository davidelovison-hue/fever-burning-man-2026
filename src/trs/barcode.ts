import type { AccessPass } from './trsTypes';

export interface BarcodePayload {
  passId: string;
  camp: string;
  department: string;
  validFrom: string;
  passType: string;
}

export function encodeBarcode(payload: BarcodePayload): string {
  return btoa(JSON.stringify(payload));
}

export function decodeBarcode(code: string): BarcodePayload | null {
  try {
    return JSON.parse(atob(code)) as BarcodePayload;
  } catch {
    return null;
  }
}

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
  payload?: BarcodePayload;
}

export function validateBarcode(
  code: string,
  scanDate: string,
  pass?: AccessPass,
): ValidationResult {
  const payload = decodeBarcode(code);
  if (!payload) {
    return { valid: false, reasons: ['Invalid or unreadable barcode'] };
  }

  const reasons: string[] = [];
  if (pass && pass.id !== payload.passId) {
    reasons.push('Pass ID mismatch');
  }
  if (scanDate < payload.validFrom) {
    reasons.push(`Too early — valid from ${payload.validFrom}`);
  }

  return {
    valid: reasons.length === 0,
    reasons,
    payload,
  };
}

export function generatePassBarcode(pass: AccessPass): string {
  return encodeBarcode({
    passId: pass.id,
    camp: pass.campName,
    department: pass.department,
    validFrom: pass.validFrom,
    passType: pass.passType,
  });
}
