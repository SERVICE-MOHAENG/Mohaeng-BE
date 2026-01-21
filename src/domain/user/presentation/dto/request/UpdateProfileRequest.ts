import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

/**
 * UpdateProfileRequest DTO
 * @description
 * - 사용자 프로필 수정 요청
 */
export class UpdateProfileRequest {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.profileImage !== null)
  @IsUrl()
  profileImage?: string | null;

  @ApiProperty({
    description: '새 비밀번호 (8-30자, 영문+숫자+특수문자)',
    example: 'NewP@ssw0rd!',
    required: false,
    minLength: 8,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message:
      '비밀번호는 8-30자이며, 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password?: string;

  @ApiProperty({
    description: '비밀번호 확인',
    example: 'NewP@ssw0rd!',
    required: false,
  })
  @IsOptional()
  @IsString()
  passwordConfirm?: string;
}
