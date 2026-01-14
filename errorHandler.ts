// Comprehensive Error Handling Utility
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): string => {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const logError = async (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`Error in ${context}:`, errorMessage, errorStack);
  }
  
  // In production, send to error tracking service (Sentry, etc.)
  if (import.meta.env.PROD && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { context },
    });
  }
};
