import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { VisitedCountryErrorCode } from './code/VisitedCountryErrorCode';

/**
 * 방문 국가 접근 권한이 없을 때 발생하는 예외
 */
export class VisitedCountryAccessDeniedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        VisitedCountryErrorCode.VISITED_COUNTRY_ACCESS_DENIED,
        '방문 국가에 접근할 권한이 없습니다',
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
