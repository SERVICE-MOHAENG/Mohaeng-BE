import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CourseSortType,
  GetCoursesRequest,
} from './GetCoursesRequest';

describe('GetCoursesRequest', () => {
  it('defaults sortBy to latest when omitted', async () => {
    const payload = plainToInstance(GetCoursesRequest, {});
    const errors = await validate(payload);

    expect(errors).toHaveLength(0);
    expect(payload.sortBy).toBe(CourseSortType.LATEST);
    expect(payload.page).toBe(1);
    expect(payload.limit).toBe(10);
  });

  it('normalizes blank sortBy to latest', async () => {
    const payload = plainToInstance(GetCoursesRequest, { sortBy: '' });
    const errors = await validate(payload);

    expect(errors).toHaveLength(0);
    expect(payload.sortBy).toBe(CourseSortType.LATEST);
  });
});
