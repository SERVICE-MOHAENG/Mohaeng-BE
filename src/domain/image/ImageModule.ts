import { Module } from '@nestjs/common';
import { ImageController } from './presentation/ImageController';

/**
 * Image Module
 * @description
 * - 이미지 업로드 도메인 모듈
 * - S3Service는 GlobalModule을 통해 전역으로 주입됨
 */
@Module({
  controllers: [ImageController],
})
export class ImageModule {}
