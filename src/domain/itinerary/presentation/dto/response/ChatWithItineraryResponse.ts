import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';

/**
 * ChatWithItineraryResponse
 * @description 로드맵 수정 채팅 응답 DTO
 */
export class ChatWithItineraryResponse {
  @ApiProperty({ description: '작업 ID (polling에 사용)' })
  jobId: string;

  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  @ApiProperty({ description: '안내 메시지' })
  message: string;

  static from(job: ItineraryJob): ChatWithItineraryResponse {
    const response = new ChatWithItineraryResponse();
    response.jobId = job.id;
    response.status = job.status;
    response.message = '요청을 처리 중입니다';
    return response;
  }
}
