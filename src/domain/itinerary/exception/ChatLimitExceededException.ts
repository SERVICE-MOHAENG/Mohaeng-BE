import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

/**
 * ChatLimitExceededException
 * @description 로드맵당 최대 대화 개수(10개)를 초과했을 때 발생하는 예외
 */
export class ChatLimitExceededException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.CHAT_LIMIT_EXCEEDED,
        '이 로드맵은 최대 대화 횟수(5회)에 도달했습니다. 더 이상 수정할 수 없습니다.',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
