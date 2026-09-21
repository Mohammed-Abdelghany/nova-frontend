import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../models/api-error.model';

export function extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
  const body = error.error as Partial<ApiError> | null;
  return body?.message || fallback;
}
