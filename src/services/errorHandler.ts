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
    // Strip technical details for user-facing messages
    return error.message; 
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const logError = async (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`Error in ${context}:`, errorMessage, error);
  }
  
  // In a real app, you would send this to Sentry/LogRocket here
};
