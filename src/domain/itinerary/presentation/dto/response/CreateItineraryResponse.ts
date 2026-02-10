import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';

export class CreateItineraryResponse {
  @ApiProperty({ description: '작업 ID (polling에 사용)' })
  jobId: string;

  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  static from(job: ItineraryJob): CreateItineraryResponse {
    const response = new CreateItineraryResponse();
    response.jobId = job.id;
    response.status = job.status;
    return response;
  }
}
