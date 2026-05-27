export const SUPPORTED_ID_TYPES = [
  "NATIONAL_ID",
  "PASSPORT",
  "DRIVERS_LICENSE",
  "RESIDENT_CARD",
  "HEALTH_INSURANCE_ID",
  "ATTESTATION_CARD",
  "ECOWAS_ID",
  "VOTER_ID",
] as const;

export const ID_TYPE_LABEL: Record<string, string> = {
  NATIONAL_ID: "Carte nationale d'identité",
  PASSPORT: "Passeport",
  DRIVERS_LICENSE: "Permis de conduire",
  RESIDENT_CARD: "Carte de résident",
  HEALTH_INSURANCE_ID: "Carte CMU / Assurance maladie",
  ATTESTATION_CARD: "Attestation d'identité",
  ECOWAS_ID: "Carte CEDEAO",
  VOTER_ID: "Carte d'électeur",
};
