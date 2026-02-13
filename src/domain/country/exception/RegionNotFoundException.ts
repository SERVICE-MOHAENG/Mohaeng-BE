import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CountryErrorCode, CountryErrorMessage } from './code';

/**
 * 지역을 찾을 수 없을 때 발생하는 예외
 */
export class RegionNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CountryErrorCode.REGION_NOT_FOUND,
        CountryErrorMessage[CountryErrorCode.REGION_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
