import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CountryErrorCode, CountryErrorMessage } from './code';

export class RegionLikeAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CountryErrorCode.REGION_LIKE_ALREADY_EXISTS,
        CountryErrorMessage[CountryErrorCode.REGION_LIKE_ALREADY_EXISTS],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
