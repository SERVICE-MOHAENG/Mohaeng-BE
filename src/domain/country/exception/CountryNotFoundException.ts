import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CountryErrorCode, CountryErrorMessage } from './code';

/**
 * 국가를 찾을 수 없을 때 발생하는 예외
 */
export class CountryNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CountryErrorCode.COUNTRY_NOT_FOUND,
        CountryErrorMessage[CountryErrorCode.COUNTRY_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
