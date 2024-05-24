import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<T> {
    // here: code to run something before a request is handled by the request handler
    console.log('Running before request is handled');
    return handler.handle().pipe(
      map((data: T) => {
        // here: code to run something before the response is sent out
        console.log('Running before response is sent out', data);

        return plainToClass(this.dto, data, {
          // Whenever we have an instance of UserDto we share only entities with @Expose()
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
