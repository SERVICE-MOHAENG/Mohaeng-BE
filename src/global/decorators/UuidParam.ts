import { Param, ParseUUIDPipe } from '@nestjs/common';
import { GlobalInvalidRequestException } from '../exception/GlobalInvalidRequestException';

export const UuidParam = (name: string = 'id'): ParameterDecorator =>
  Param(
    name,
    new ParseUUIDPipe({
      exceptionFactory: () => new GlobalInvalidRequestException(),
    }),
  );
