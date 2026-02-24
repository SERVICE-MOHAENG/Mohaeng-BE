import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ImageUploadResponse } from './dto/response/ImageUploadResponse';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { AdminApiBearerAuth } from '../../../global/decorators/AdminApiBearerAuth';
import { ImageService } from '../service/ImageService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Image Controller
 * @description
 * - 이미지 업로드 API (S3)
 */
@ApiTags('images')
@Controller('v1/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UserApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({
    summary: '이미지 업로드',
    description: 'S3에 이미지를 업로드하고 URL을 반환합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일 (jpg, jpeg, png, webp / 최대 10MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '업로드 성공',
    type: ImageUploadResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 파일 형식 또는 크기 초과' })
  @ApiResponse({ status: 500, description: 'S3 업로드 실패' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageUploadResponse> {
    const url = await this.imageService.uploadImage(file);
    return ImageUploadResponse.from(url);
  }

  @Post('upload/admin')
  @AdminApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({
    summary: '관리자 이미지 업로드',
    description: 'S3에 관리자 이미지를 업로드하고 URL을 반환합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일 (jpg, jpeg, png, webp / 최대 10MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '업로드 성공',
    type: ImageUploadResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 파일 형식 또는 크기 초과' })
  @ApiResponse({ status: 500, description: 'S3 업로드 실패' })
  async uploadAdminImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageUploadResponse> {
    const url = await this.imageService.uploadImage(file, 'admin-images');
    return ImageUploadResponse.from(url);
  }
}
