import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthEmailAlreadyRegisteredWithDifferentProviderException } from './AuthEmailAlreadyRegisteredWithDifferentProviderException';
import { AuthErrorCode, AuthErrorMessage } from './code';

describe('AuthEmailAlreadyRegisteredWithDifferentProviderException', () => {
  it('uses the shared auth error message', () => {
    const exception =
      new AuthEmailAlreadyRegisteredWithDifferentProviderException();

    expect(exception.getResponse()).toEqual(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER,
        AuthErrorMessage[
          AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER
        ],
      ),
    );
  });
});
