import { ValidationError } from '@nestjs/common';

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  const collect = (error: ValidationError, parentPath?: string) => {
    const currentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const constraint of Object.values(error.constraints)) {
        messages.push(
          currentPath ? `${currentPath}: ${constraint}` : constraint,
        );
      }
    }

    for (const child of error.children ?? []) {
      collect(child, currentPath);
    }
  };

  for (const error of errors) {
    collect(error);
  }

  return messages.length > 0 ? messages : ['Validation failed'];
}
