import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';

export class ItineraryJobStatusResponse {
  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  @ApiProperty({ description: '시도 횟수' })
  attemptCount: number;

  @ApiProperty({ description: '에러 코드', nullable: true })
  errorCode: string | null;

  @ApiProperty({ description: '에러 메시지', nullable: true })
  errorMessage: string | null;

  @ApiProperty({ description: '작업 생성 시각' })
  createdAt: Date;

  @ApiProperty({ description: '처리 시작 시각', nullable: true })
  startedAt: Date | null;

  @ApiProperty({ description: '완료 시각', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ description: '생성된 로드맵 ID (SUCCESS 시)', nullable: true })
  travelCourseId: string | null;

  static from(job: ItineraryJob): ItineraryJobStatusResponse {
    const response = new ItineraryJobStatusResponse();
    response.status = job.status;
    response.attemptCount = job.attemptCount;
    response.errorCode = job.errorCode;
    response.errorMessage = job.errorMessage;
    response.createdAt = job.createdAt;
    response.startedAt = job.startedAt;
    response.completedAt = job.completedAt;
    response.travelCourseId = job.travelCourseId;
    return response;
  }
}
