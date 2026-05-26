import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug: lettres minuscules, chiffres et tirets uniquement',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeMessage?: string;
}
