import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';
import { IntentStatus } from '../../../entity/ItineraryJob.entity';

/**
 * ItineraryModificationJobStatusResponse
 * @description 로드맵 수정 작업 상태 조회 응답 DTO
 */
export class ItineraryModificationJobStatusResponse {
  @ApiProperty({ description: '작업 ID' })
  jobId: string;

  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  @ApiProperty({
    description: 'Intent 분류 결과',
    enum: IntentStatus,
    nullable: true,
  })
  intentStatus: IntentStatus | null;

  @ApiProperty({ description: 'AI 응답 메시지', nullable: true })
  message: string | null;

  @ApiProperty({
    description: '변경된 노드 ID 목록',
    type: [String],
    nullable: true,
  })
  diffKeys: string[] | null;

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

  static from(job: ItineraryJob): ItineraryModificationJobStatusResponse {
    const response = new ItineraryModificationJobStatusResponse();
    response.jobId = job.id;
    response.status = job.status;
    response.intentStatus = job.intentStatus;
    response.message = job.llmCommentary;
    response.diffKeys = job.diffKeys;
    response.errorCode = job.errorCode;
    response.errorMessage = job.errorMessage;
    response.createdAt = job.createdAt;
    response.startedAt = job.startedAt;
    response.completedAt = job.completedAt;
    return response;
  }
}
