/** Contact helpers — Perú */

const INVALID = /^(no\s*registrado|s\/?n|null|undefined|-)$/i;

export function cleanContactValue(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || INVALID.test(s)) return null;
  return s;
}

/** Extrae dígitos y normaliza a formato E.164 Perú (+51...) cuando es posible */
export function normalizePeruPhone(raw: unknown): {
  display: string;
  e164: string;
  national: string;
} | null {
  const cleaned = cleanContactValue(raw);
  if (!cleaned) return null;

  let digits = cleaned.replace(/\D/g, "");
  if (!digits) return null;

  // Quitar ceros iniciales de marcación internacional 0051...
  if (digits.startsWith("0051")) digits = digits.slice(2);
  if (digits.startsWith("51") && digits.length >= 11) {
    // already with country code
  } else if (digits.length === 9) {
    digits = `51${digits}`;
  } else if (digits.length === 8 || digits.length === 7) {
    // landline without area — keep as-is with 51 if plausible
    digits = `51${digits}`;
  } else if (digits.length < 7) {
    return null;
  }

  const national = digits.startsWith("51") ? digits.slice(2) : digits;
  return {
    display: cleaned,
    e164: `+${digits}`,
    national,
  };
}

export function telHref(raw: unknown): string | null {
  const phone = normalizePeruPhone(raw);
  return phone ? `tel:${phone.e164}` : null;
}

export function whatsappHref(raw: unknown, message?: string): string | null {
  const phone = normalizePeruPhone(raw);
  if (!phone) return null;
  const num = phone.e164.replace(/\D/g, "");
  const base = `https://wa.me/${num}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function mailHref(raw: unknown, subject?: string): string | null {
  const email = cleanContactValue(raw);
  if (!email || !email.includes("@")) return null;
  if (subject) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
  return `mailto:${email}`;
}

export function findEmail(detalle: Record<string, unknown> | null): string | null {
  if (!detalle) return null;
  const keys = ["email", "correo", "mail", "eMail", "Email"];
  for (const key of keys) {
    const v = cleanContactValue(detalle[key]);
    if (v && v.includes("@")) return v;
  }
  // case-insensitive scan
  for (const [key, value] of Object.entries(detalle)) {
    if (!/mail|correo/i.test(key)) continue;
    const v = cleanContactValue(value);
    if (v && v.includes("@")) return v;
  }
  return null;
}
