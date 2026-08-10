import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidIANATimezone } from '../utils/timezone.js';

@ValidatorConstraint({ name: 'isIANATimezone', async: false })
export class IsIANATimezoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return isValidIANATimezone(value);
  }

  defaultMessage(): string {
    return 'timezone must be a valid IANA timezone identifier (e.g. UTC, Asia/Kolkata)';
  }
}

export function IsIANATimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsIANATimezoneConstraint,
    });
  };
}
