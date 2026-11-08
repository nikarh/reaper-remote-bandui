// Maps fader positions (0..1) to gain, as in reaper-bandcontrol. Silence at 0, -60..-20 dB over the first quarter and
// -20..+12 dB over the rest, so most of the travel is where levels are actually set.

export const MAX_DB = 12;
const MIN_DB = -60;
const KNEE_DB = -20;
const KNEE_POSITION = 0.25;

export function gainToDb(gain: number): number {
  return gain <= 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(gain);
}

export function dbToGain(db: number): number {
  return db === Number.NEGATIVE_INFINITY ? 0 : 10 ** (db / 20);
}

export function dbToPosition(db: number): number {
  let p: number;
  if (db === Number.NEGATIVE_INFINITY) {
    p = 0;
  } else if (db < KNEE_DB) {
    p = (KNEE_POSITION * (db - MIN_DB)) / (KNEE_DB - MIN_DB);
  } else {
    p =
      KNEE_POSITION +
      ((1 - KNEE_POSITION) * (db - KNEE_DB)) / (MAX_DB - KNEE_DB);
  }
  return Math.max(0, Math.min(1, p));
}

export function positionToDb(position: number): number {
  const p = Math.max(0, Math.min(1, position));
  if (p <= 0) {
    return Number.NEGATIVE_INFINITY;
  }
  if (p < KNEE_POSITION) {
    return MIN_DB + (p / KNEE_POSITION) * (KNEE_DB - MIN_DB);
  }
  return (
    KNEE_DB + ((p - KNEE_POSITION) / (1 - KNEE_POSITION)) * (MAX_DB - KNEE_DB)
  );
}

export function gainToPosition(gain: number): number {
  return dbToPosition(gainToDb(gain));
}

export function positionToGain(position: number): number {
  return dbToGain(positionToDb(position));
}

/** Where 0 dB sits. */
export const UNITY_POSITION = dbToPosition(0);

/** `-3.2`, `+6.0`, `0.0`, `-inf`. */
export function formatDb(db: number): string {
  if (db === Number.NEGATIVE_INFINITY || db < -150) return "-inf";
  if (db >= 0.05) return `+${db.toFixed(1)}`;
  if (db > -0.05) return "0.0";
  return db.toFixed(1);
}
