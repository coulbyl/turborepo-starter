import { IsEnum } from 'class-validator';
import { MemberRole } from '@identis/db';

export class UpdateMemberRoleDto {
  @IsEnum(MemberRole)
  role!: MemberRole;
}
