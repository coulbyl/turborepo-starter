import { IsEmail, IsOptional } from 'class-validator';

export class UpdateIdentityDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
