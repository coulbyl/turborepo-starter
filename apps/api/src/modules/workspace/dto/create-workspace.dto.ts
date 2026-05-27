import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  sectorLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeMessage?: string;
}
