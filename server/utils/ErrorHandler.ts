class ErrorHandler extends Error {
  statusCode: Number;
  errors?: [];
  success: boolean;

  constructor(message: any, statusCode: Number, errors?: []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ErrorHandler;
