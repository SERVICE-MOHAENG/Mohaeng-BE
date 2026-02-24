import { Module } from '@nestjs/common';
import { S3Service } from './S3Service';

/**
 * S3 Module
 * @description
 * - AWS S3 업로드 서비스 제공
 * - GlobalModule을 통해 전역으로 제공됨
 */
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
