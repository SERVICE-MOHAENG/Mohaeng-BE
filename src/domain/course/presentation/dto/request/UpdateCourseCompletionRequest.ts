import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * UpdateCourseCompletionRequest DTO
 * @description
 * - 여행 완료 여부 변경 요청
 */
export class UpdateCourseCompletionRequest {
  @ApiProperty({
    description: '여행 완료 여부',
    example: true,
  })
  @IsBoolean()
  isCompleted: boolean;
}
