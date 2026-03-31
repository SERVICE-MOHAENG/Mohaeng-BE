import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * CreateBlogRequest DTO
 * @description
 * - 여행 블로그 생성 요청
 */
export class CreateBlogRequest {
  @ApiProperty({
    description: '연결할 완료된 로드맵 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  travelCourseId: string;

  @ApiProperty({
    description: '블로그 제목',
    example: '파리 여행 후기',
    minLength: 1,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '블로그 내용',
    example: '에펠탑에서 본 야경이 정말 아름다웠습니다...',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    description: '블로그 이미지 URL 목록',
    example: [
      'https://example.com/image-1.jpg',
      'https://example.com/image-2.jpg',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUrl({}, { each: true, message: '유효한 URL 형식이어야 합니다' })
  imageUrls?: string[];

  @ApiProperty({
    description: '블로그 태그 목록',
    example: ['뉴욕', '미식', '도시여행'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({
    description: '공개 여부',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}
