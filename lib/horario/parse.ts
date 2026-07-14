/**
 * Parseo de horarios DIGEMID / texto libre — evaluación en zona America/Lima.
 */

export type HoursStatus =
  | "open"
  | "closed"
  | "closes_soon"
  | "opens_soon"
  | "always_open"
  | "unknown";

export type HoursEvaluation = {
  status: HoursStatus;
  labelKey: HoursStatus;
  raw: string;
  limaNowLabel: string;
};

const LIMA_TZ = "America/Lima";

const DAY_ALIASES: Record<string, number> = {
  dom: 0,
  domingo: 0,
  sun: 0,
  lun: 1,
  lunes: 1,
  mon: 1,
  mar: 2,
  martes: 2,
  tue: 2,
  mie: 3,
  miercoles: 3,
  miércoles: 3,
  wed: 3,
  jue: 4,
  jueves: 4,
  thu: 4,
  vie: 5,
  viernes: 5,
  fri: 5,
  sab: 6,
  sabado: 6,
  sábado: 6,
  sat: 6,
};

function limaParts(date = new Date(), locale = "es") {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: LIMA_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;
  const minute = Number(get("minute"));

  return {
    day: weekdayMap[get("weekday")] ?? 0,
    minutes: hour * 60 + minute,
    label: new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
      timeZone: LIMA_TZ,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseTimeToken(token: string): number | null {
  const m = token.trim().match(/^(\d{1,2})(?::|\.)?(\d{2})?\s*(a\.?m\.?|p\.?m\.?)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? "0");
  const ampm = (m[3] ?? "").toLowerCase();
  if (ampm.startsWith("p") && h < 12) h += 12;
  if (ampm.startsWith("a") && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function expandDayRange(from: number, to: number): number[] {
  const days: number[] = [];
  let d = from;
  for (let i = 0; i < 7; i++) {
    days.push(d);
    if (d === to) break;
    d = (d + 1) % 7;
  }
  return days;
}

type Interval = { days: number[]; start: number; end: number };

function parseIntervals(raw: string): Interval[] | "always" | null {
  const text = normalize(raw);
  if (!text || /no\s*registrado|no\s*disponible|s\/n/.test(text)) return null;

  if (
    /24\s*horas|24h|las\s*24|todo\s*el\s*dia|todos\s*los\s*dias\s*24|open\s*24/.test(
      text,
    )
  ) {
    return "always";
  }

  const intervals: Interval[] = [];

  // "lunes a viernes de 8:00 a 20:00" / "lun-vie 08:00-20:00"
  const rangeRe =
    /(lun(?:es)?|mar(?:tes)?|mie(?:rcoles)?|miércoles|jue(?:ves)?|vie(?:rnes)?|sab(?:ado)?|sábado|dom(?:ingo)?)\s*(?:a|-|–|—)\s*(lun(?:es)?|mar(?:tes)?|mie(?:rcoles)?|miércoles|jue(?:ves)?|vie(?:rnes)?|sab(?:ado)?|sábado|dom(?:ingo)?)\s*(?:de|:)?\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)\s*(?:a|hasta|-|–|—)\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)/gi;

  let match: RegExpExecArray | null;
  while ((match = rangeRe.exec(text))) {
    const from = DAY_ALIASES[normalize(match[1] ?? "")];
    const to = DAY_ALIASES[normalize(match[2] ?? "")];
    const start = parseTimeToken(match[3] ?? "");
    const end = parseTimeToken(match[4] ?? "");
    if (from == null || to == null || start == null || end == null) continue;
    intervals.push({ days: expandDayRange(from, to), start, end });
  }

  // Single day: "sabado 8:00 a 13:00"
  const singleRe =
    /(lun(?:es)?|mar(?:tes)?|mie(?:rcoles)?|miércoles|jue(?:ves)?|vie(?:rnes)?|sab(?:ado)?|sábado|dom(?:ingo)?)\s*(?:de|:)?\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)\s*(?:a|hasta|-|–|—)\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)/gi;
  while ((match = singleRe.exec(text))) {
    const day = DAY_ALIASES[normalize(match[1] ?? "")];
    const start = parseTimeToken(match[2] ?? "");
    const end = parseTimeToken(match[3] ?? "");
    if (day == null || start == null || end == null) continue;
    // avoid duplicates already captured by ranges
    const exists = intervals.some(
      (iv) =>
        iv.days.length === 1 &&
        iv.days[0] === day &&
        iv.start === start &&
        iv.end === end,
    );
    if (!exists) intervals.push({ days: [day], start, end });
  }

  // Generic "de 8:00 a 20:00" without days → assume Mon-Sat common in Peru retail
  if (!intervals.length) {
    const generic = text.match(
      /(?:de|:)?\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)\s*(?:a|hasta|-|–|—)\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:a\.?m\.?|p\.?m\.?)?)/i,
    );
    if (generic) {
      const start = parseTimeToken(generic[1] ?? "");
      const end = parseTimeToken(generic[2] ?? "");
      if (start != null && end != null) {
        intervals.push({
          days: [1, 2, 3, 4, 5, 6],
          start,
          end,
        });
      }
    }
  }

  return intervals.length ? intervals : null;
}

function isWithin(interval: Interval, day: number, minutes: number): boolean {
  if (!interval.days.includes(day)) return false;
  if (interval.end > interval.start) {
    return minutes >= interval.start && minutes < interval.end;
  }
  // overnight e.g. 22:00–06:00
  return minutes >= interval.start || minutes < interval.end;
}

function minutesUntilClose(
  intervals: Interval[],
  day: number,
  minutes: number,
): number | null {
  for (const iv of intervals) {
    if (!isWithin(iv, day, minutes)) continue;
    if (iv.end > iv.start) return iv.end - minutes;
    // overnight: closing is next morning
    return 24 * 60 - minutes + iv.end;
  }
  return null;
}

function minutesUntilOpen(
  intervals: Interval[],
  day: number,
  minutes: number,
): number | null {
  let best: number | null = null;
  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7;
    for (const iv of intervals) {
      if (!iv.days.includes(d)) continue;
      let delta: number;
      if (offset === 0) {
        if (minutes < iv.start) delta = iv.start - minutes;
        else continue;
      } else {
        delta = offset * 24 * 60 - minutes + iv.start;
      }
      if (best == null || delta < best) best = delta;
    }
  }
  return best;
}

export function evaluateBusinessHours(
  raw: unknown,
  now = new Date(),
  locale = "es",
): HoursEvaluation {
  const text = raw == null ? "" : String(raw).trim();
  const { day, minutes, label } = limaParts(now, locale);

  if (!text) {
    return {
      status: "unknown",
      labelKey: "unknown",
      raw: text,
      limaNowLabel: label,
    };
  }

  const parsed = parseIntervals(text);
  if (parsed === "always") {
    return {
      status: "always_open",
      labelKey: "always_open",
      raw: text,
      limaNowLabel: label,
    };
  }
  if (!parsed) {
    return {
      status: "unknown",
      labelKey: "unknown",
      raw: text,
      limaNowLabel: label,
    };
  }

  const openNow = parsed.some((iv) => isWithin(iv, day, minutes));
  if (openNow) {
    const untilClose = minutesUntilClose(parsed, day, minutes);
    if (untilClose != null && untilClose <= 60) {
      return {
        status: "closes_soon",
        labelKey: "closes_soon",
        raw: text,
        limaNowLabel: label,
      };
    }
    return {
      status: "open",
      labelKey: "open",
      raw: text,
      limaNowLabel: label,
    };
  }

  const untilOpen = minutesUntilOpen(parsed, day, minutes);
  if (untilOpen != null && untilOpen <= 60) {
    return {
      status: "opens_soon",
      labelKey: "opens_soon",
      raw: text,
      limaNowLabel: label,
    };
  }

  return {
    status: "closed",
    labelKey: "closed",
    raw: text,
    limaNowLabel: label,
  };
}
