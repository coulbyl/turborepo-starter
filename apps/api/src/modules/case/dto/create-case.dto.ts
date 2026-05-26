import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

// All country codes supported by Smile ID (extends as new countries are activated)
export const SUPPORTED_COUNTRIES = [
  // BCEAO zone (JT11 authority lookup available)
  'CI', 'SN', 'BJ', 'GH', 'NG', 'KE', 'ZA', 'TZ', 'UG', 'RW', 'ET', 'CM',
  // DocV only
  'BF', 'ML', 'TG', 'MR', 'NE', 'GN',
  // International (passport via JT6 ICAO MRZ)
  'FR', 'US', 'GB', 'DE', 'LB', 'CN', 'MA', 'DZ', 'TN', 'EG',
] as const;

export const SUPPORTED_ID_TYPES = [
  'NATIONAL_ID',
  'PASSPORT',
  'DRIVERS_LICENSE',
  'RESIDENT_CARD',
  'HEALTH_INSURANCE_ID',
  'ATTESTATION_CARD',
  'ECOWAS_ID',
  'VOTER_ID',
] as const;

export class CreateCaseDto {
  // ── Subject identity info ────────────────────────────────────────────────

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format attendu: yyyy-mm-dd' })
  dateOfBirth?: string;

  // ── Document info ────────────────────────────────────────────────────────

  @IsNotEmpty()
  @IsString()
  country: string; // ISO 3166-1 alpha-2 — validated against support matrix at service level

  @IsNotEmpty()
  @IsEnum(SUPPORTED_ID_TYPES, {
    message: `Type de document non supporté. Valeurs: ${SUPPORTED_ID_TYPES.join(', ')}`,
  })
  idType: string;

  @IsOptional()
  @IsString()
  idNumber?: string; // Optional — enables authority pre-check when provided

  // ── Images are received as multipart files (Express.Multer.File) ─────────
  // selfie, idFront, idBack are injected by FileFieldsInterceptor,
  // not part of the class-validator DTO.
}
