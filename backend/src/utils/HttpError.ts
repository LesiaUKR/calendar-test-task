const defaultMessages: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? defaultMessages[status] ?? 'Internal server error');
    this.status = status;
  }
}

export default HttpError;
