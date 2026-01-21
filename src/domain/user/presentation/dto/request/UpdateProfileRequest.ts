import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileRequest {
  @ApiProperty({
    description: '이름 (1~100자)',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: '프로필 이미지 URL (null 허용)',
    example: 'https://example.com/profile.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.profileImage !== null)
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다.' })
  profileImage?: string | null;

  @ApiProperty({
    description: '비밀번호 (8~30자, 영문, 숫자, 특수문자 포함)',
    example: 'P@ssw0rd!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message:
      '비밀번호는 8~30자의 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.',
  })
  password?: string;

  @ApiProperty({
    description: '비밀번호 확인 (8~30자, 영문, 숫자, 특수문자 포함)',
    example: 'P@ssw0rd!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message:
      '비밀번호는 8~30자의 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.',
  })
  passwordConfirm?: string;
}
