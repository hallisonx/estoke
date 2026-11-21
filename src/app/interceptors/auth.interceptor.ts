import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  AUTH_API_BASE_URL,
  AUTH_LOGIN_URL,
  AuthService,
} from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (
    request.url === AUTH_LOGIN_URL ||
    !request.url.startsWith(`${AUTH_API_BASE_URL}/`)
  ) {
    return next(request);
  }

  const authorization = inject(AuthService).authorizationHeader();
  return authorization
    ? next(request.clone({ setHeaders: { Authorization: authorization } }))
    : next(request);
};
