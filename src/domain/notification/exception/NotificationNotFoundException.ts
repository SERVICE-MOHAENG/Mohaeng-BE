import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { NotificationErrorCode } from './code/NotificationErrorCode';

/**
 * 알림을 찾을 수 없을 때 발생하는 예외
 */
export class NotificationNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        '알림을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
