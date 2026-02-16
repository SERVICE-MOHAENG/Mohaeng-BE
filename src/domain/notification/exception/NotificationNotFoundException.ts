import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { NotificationErrorCode, NotificationErrorMessage } from './code';

/**
 * 알림을 찾을 수 없을 때 발생하는 예외
 */
export class NotificationNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        NotificationErrorMessage[NotificationErrorCode.NOTIFICATION_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
