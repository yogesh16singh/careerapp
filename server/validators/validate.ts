import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

/**
 * @description This is the validate middleware responsible for centralizing error checking done by `express-validator`.
 * It checks if the request validation has errors.
 * If errors exist, it structures them and throws an `ApiError` which forwards the error to the global error handler.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: Record<string, string>[] = [];
  errors.array().forEach((err) => {
    if ('path' in err) {
      extractedErrors.push({ [err.path]: err.msg });
    } else {
      // Handle the case where the error object doesn't have a 'path' property
      // For example, you could push a default error message or log a warning
      extractedErrors.push({ error: 'Unknown error' });
    }
  });
  return next(new ErrorHandler("Received data is not valid", 422))
  
//   throw new ApiError(422, "Received data is not valid", extractedErrors);
};
