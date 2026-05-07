import { ApiProperty } from '@nestjs/swagger';
import {
  PreferenceJob,
  PreferenceJobStatus,
} from '../../../entity/PreferenceJob.entity';

export class CreatePreferenceResponse {
  @ApiProperty({ description: '작업 ID (polling에 사용)' })
  jobId: string;

  @ApiProperty({ description: '작업 상태', enum: PreferenceJobStatus })
  status: PreferenceJobStatus;

  static from(job: PreferenceJob): CreatePreferenceResponse {
    const response = new CreatePreferenceResponse();
    response.jobId = job.id;
    response.status = job.status;
    return response;
  }
}
