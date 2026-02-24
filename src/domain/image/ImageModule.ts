import { Module } from '@nestjs/common';
import { ImageController } from './presentation/ImageController';
import { AdminImageController } from './presentation/AdminImageController';
import { ImageService } from './service/ImageService';

/**
 * Image Module
 * @description
 * - 이미지 업로드 도메인 모듈
 * - S3Service는 GlobalModule을 통해 전역으로 주입됨
 */
@Module({
  controllers: [ImageController, AdminImageController],
  providers: [ImageService],
})
export class ImageModule {}
