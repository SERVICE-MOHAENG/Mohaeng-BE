import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { VisitedCountryErrorCode, VisitedCountryErrorMessage } from './code';

/**
 * 방문 국가 접근 권한이 없을 때 발생하는 예외
 */
export class VisitedCountryAccessDeniedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        VisitedCountryErrorCode.VISITED_COUNTRY_ACCESS_DENIED,
        VisitedCountryErrorMessage[
          VisitedCountryErrorCode.VISITED_COUNTRY_ACCESS_DENIED
        ],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
