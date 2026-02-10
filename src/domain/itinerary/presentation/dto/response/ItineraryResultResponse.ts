import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';
import { CourseResponse } from '../../../../course/presentation/dto/response/CourseResponse';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';

export class ItineraryResultResponse {
  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  @ApiProperty({ description: '여행 코스 ID', nullable: true })
  courseId: string | null;

  @ApiProperty({ description: 'LLM 코멘터리 (코스 선정 이유)', nullable: true })
  llmCommentary: string | null;

  @ApiProperty({ description: '다음 행동 제안 목록', nullable: true })
  nextActionSuggestions: string[] | null;

  @ApiProperty({ description: '에러 코드', nullable: true })
  errorCode: string | null;

  @ApiProperty({ description: '에러 메시지', nullable: true })
  errorMessage: string | null;

  @ApiProperty({ description: '작업 생성 시각' })
  createdAt: Date;

  @ApiProperty({ description: '완료 시각', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ description: '생성된 코스 상세', nullable: true, type: CourseResponse })
  course: CourseResponse | null;

  static from(
    job: ItineraryJob,
    course?: TravelCourse | null,
  ): ItineraryResultResponse {
    const response = new ItineraryResultResponse();
    response.status = job.status;
    response.courseId = job.travelCourseId;
    response.llmCommentary = job.llmCommentary;
    response.nextActionSuggestions = job.nextActionSuggestions;
    response.errorCode = job.errorCode;
    response.errorMessage = job.errorMessage;
    response.createdAt = job.createdAt;
    response.completedAt = job.completedAt;
    response.course = course ? CourseResponse.fromEntity(course) : null;
    return response;
  }
}
