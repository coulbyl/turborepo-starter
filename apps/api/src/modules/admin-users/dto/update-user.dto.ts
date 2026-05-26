import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsIn(['ADMIN', 'MEMBER'])
  role?: 'ADMIN' | 'MEMBER';

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
