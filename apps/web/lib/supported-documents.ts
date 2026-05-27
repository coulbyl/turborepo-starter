// Mirror de smile-id.constants.ts — mettre à jour en même temps que le backend.

const JT11_SUPPORT: Record<string, string[]> = {
  CI: [
    "NATIONAL_ID",
    "DRIVERS_LICENSE",
    "PASSPORT",
    "HEALTH_INSURANCE_ID",
    "ATTESTATION_CARD",
    "RESIDENT_CARD",
  ],
  SN: ["NATIONAL_ID", "PASSPORT", "ECOWAS_ID"],
  BJ: ["NATIONAL_ID", "RESIDENT_CARD", "PASSPORT"],
  GH: ["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE", "VOTER_ID"],
  NG: ["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE", "VOTER_ID"],
  KE: ["NATIONAL_ID", "PASSPORT"],
  ZA: ["NATIONAL_ID", "PASSPORT"],
  TZ: ["NATIONAL_ID", "PASSPORT"],
  UG: ["NATIONAL_ID", "PASSPORT"],
  RW: ["NATIONAL_ID", "PASSPORT"],
  ET: ["NATIONAL_ID", "PASSPORT"],
  CM: ["NATIONAL_ID", "PASSPORT"],
};

const JT6_SUPPORT: Record<string, string[]> = {
  BF: ["NATIONAL_ID", "PASSPORT"],
  ML: ["PASSPORT"],
  TG: ["RESIDENT_CARD", "PASSPORT"],
  MR: ["NATIONAL_ID", "PASSPORT"],
  NE: ["NATIONAL_ID", "PASSPORT"],
  GN: ["NATIONAL_ID", "PASSPORT"],
  FR: ["PASSPORT", "NATIONAL_ID"],
  US: ["PASSPORT", "DRIVERS_LICENSE"],
  GB: ["PASSPORT"],
  DE: ["PASSPORT", "NATIONAL_ID"],
  LB: ["PASSPORT", "NATIONAL_ID"],
  CN: ["PASSPORT"],
  MA: ["NATIONAL_ID", "PASSPORT"],
  DZ: ["NATIONAL_ID", "PASSPORT"],
  TN: ["NATIONAL_ID", "PASSPORT"],
  EG: ["NATIONAL_ID", "PASSPORT"],
};

/**
 * Retourne les types de document supportés pour un pays donné.
 * PASSPORT est toujours inclus (fallback universel ICAO MRZ).
 */
export function getSupportedIdTypes(country: string): string[] {
  const upper = country.toUpperCase();
  const supported = new Set<string>(["PASSPORT"]);
  for (const t of JT11_SUPPORT[upper] ?? []) supported.add(t);
  for (const t of JT6_SUPPORT[upper] ?? []) supported.add(t);
  return Array.from(supported);
}
