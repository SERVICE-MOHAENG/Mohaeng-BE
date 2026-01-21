import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
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
    description: '블로그 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '공개 여부',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}
