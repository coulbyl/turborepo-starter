import { IsEmail, IsEnum } from 'class-validator';
import { MemberRole } from '@identis/db';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(MemberRole)
  role!: MemberRole;
}
