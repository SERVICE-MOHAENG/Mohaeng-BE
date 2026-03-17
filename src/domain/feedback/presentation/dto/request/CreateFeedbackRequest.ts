import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackRequest {
  @ApiProperty({
    description: '피드백 제목',
    example: '일정 수정 결과가 바로 반영되지 않아요',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: '피드백 내용',
    example: '로드맵 수정 요청 후 반영된 결과를 확인하기 어렵습니다.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
