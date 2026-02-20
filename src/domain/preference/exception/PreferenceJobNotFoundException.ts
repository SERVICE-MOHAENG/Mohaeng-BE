import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { PreferenceErrorCode, PreferenceErrorMessage } from './code';

export class PreferenceJobNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        PreferenceErrorCode.PREFERENCE_JOB_NOT_FOUND,
        PreferenceErrorMessage[PreferenceErrorCode.PREFERENCE_JOB_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
