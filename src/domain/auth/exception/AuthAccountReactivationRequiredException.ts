import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { Provider } from '../../user/entity/Provider.enum';
import { AuthErrorCode, AuthErrorMessage } from './code';

type ReactivationRequiredPayload = {
  reactivationToken: string;
  provider: Provider;
};

export class AuthAccountReactivationRequiredException extends HttpException {
  constructor(payload: ReactivationRequiredPayload) {
    super(
      new ApiResponseDto(
        false,
        AuthErrorCode.ACCOUNT_REACTIVATION_REQUIRED,
        AuthErrorMessage[AuthErrorCode.ACCOUNT_REACTIVATION_REQUIRED],
        payload,
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
