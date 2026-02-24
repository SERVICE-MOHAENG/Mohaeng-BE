import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '../../../entity/Admin.entity';

export class AdminRegisterResponse {
  @ApiProperty({ description: '관리자 ID' })
  id: string;

  @ApiProperty({ description: '관리자 이메일' })
  email: string;

  @ApiProperty({ description: '슈퍼어드민 여부' })
  isSuperAdmin: boolean;

  static from(admin: Admin): AdminRegisterResponse {
    const res = new AdminRegisterResponse();
    res.id = admin.id;
    res.email = admin.email;
    res.isSuperAdmin = admin.isSuperAdmin;
    return res;
  }
}
