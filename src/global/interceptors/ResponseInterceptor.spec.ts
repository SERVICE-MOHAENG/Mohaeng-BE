import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { ResponseInterceptor } from './ResponseInterceptor';

class WrappedController {
  wrapped() {
    return undefined;
  }
}

describe('ResponseInterceptor', () => {
  const createExecutionContext = (
    controller: new () => unknown,
    handlerName: string,
  ): ExecutionContext =>
    ({
      getHandler: () => controller.prototype[handlerName],
      getClass: () => controller,
    }) as ExecutionContext;

  it('wraps normal responses with ApiResponseDto', async () => {
    const interceptor = new ResponseInterceptor();
    const context = createExecutionContext(WrappedController, 'wrapped');
    const next = {
      handle: () => of({ hello: 'world' }),
    } as CallHandler;

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toBeInstanceOf(ApiResponseDto);
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: { hello: 'world' },
      }),
    );
  });
});
