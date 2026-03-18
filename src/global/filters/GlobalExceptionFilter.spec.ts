import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { GlobalExceptionFilter } from './GlobalExceptionFilter';

describe('GlobalExceptionFilter', () => {
  const createHost = () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = {
      method: 'GET',
      originalUrl: '/api/v1/blogs/me',
      url: '/api/v1/blogs/me',
      body: undefined,
    };

    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as any;

    return { host, response };
  };

  it('returns 400 for postgres invalid uuid syntax errors', () => {
    const filter = new GlobalExceptionFilter();
    const { host, response } = createHost();
    const driverError = Object.assign(
      new Error('invalid input syntax for type uuid: "me"'),
      { code: '22P02' },
    );
    const exception = new QueryFailedError(
      'SELECT * FROM travel_blog WHERE id = $1',
      ['me'],
      driverError,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errorCode: 'TRIP_CORE_HE_GLB_V001',
      }),
    );
  });

  it('keeps generic database failures as 500', () => {
    const filter = new GlobalExceptionFilter();
    const { host, response } = createHost();
    const driverError = Object.assign(
      new Error('duplicate key value violates unique constraint'),
      { code: '23505' },
    );
    const exception = new QueryFailedError('SELECT 1', [], driverError);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errorCode: 'TRIP_CORE_HE_GLB_C002',
      }),
    );
  });
});
