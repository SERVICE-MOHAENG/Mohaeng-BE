import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/**
 * S3 Service
 * @description
 * - AWS S3 파일 업로드/삭제 처리
 */
@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucketName = configService.get<string>('AWS_S3_BUCKET_NAME')!;
    this.baseUrl = configService.get<string>('AWS_S3_BASE_URL')!;
  }

  /**
   * S3에 파일 업로드
   * @param buffer - 파일 버퍼
   * @param originalName - 원본 파일명 (확장자 추출용)
   * @param mimeType - 파일 MIME 타입
   * @param folder - S3 폴더명 (기본값: 'images')
   * @returns 업로드된 파일의 S3 URL
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'images',
  ): Promise<string> {
    const ext = path.extname(originalName);
    const key = `${folder}/${uuidv4()}${ext}`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      },
    });

    await upload.done();
    return `${this.baseUrl}/${key}`;
  }
}
