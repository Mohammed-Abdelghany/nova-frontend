export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  validationErrors: Record<string, string> | null;
}
