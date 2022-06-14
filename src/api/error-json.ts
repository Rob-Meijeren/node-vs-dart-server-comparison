import { NextFunction, Request, Response } from 'express';
import { isError, isObject } from 'lodash';
import * as uuid from 'uuid';

/**
 * Middleware to format all errors as a JSON response
 *
 * @export
 * @param {*} err Error or object representing an error
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
export function errorJSON(err: any, req: Request, res: Response, next: NextFunction) {

  // Create an error reference
  //
  const errorReference = uuid.v4();

  if (isError(err)) {
    console.error(`[API-ERROR:${req.method}:${req.path}:ERR#${errorReference}] Error caught`, err);

    // Don't expose internal errors
    //
    res.status(500).send({
      code:    500,
      message: `An error occurred while processing your request. Error reference: ${errorReference}`,
      name:    'Error',
    });
  } else if (isObject(err)) {
    const errorObject: any = err;
    console.error(`[API-ERROR:${req.method}:${req.path}:ERR#${errorReference}] Object caught`, new Error(errorObject?.message || 'UNKNOWN_ERROR_OBJECT'), errorObject);
    res.status(errorObject.code || 500).send({
      code:    errorObject.code || 500,
      errors:  errorObject.errors,
      message: errorObject.message,
      name:    errorObject.name,
    });
  } else {
    console.error(`[API-ERROR:${req.method}:${req.path}:ERR#${errorReference}] Unknown error caught`, new Error('UNKNOWN'), err);

    // Don't expose internal errors
    //
    res.status(500).send({
      code:    500,
      message: `An error occurred while processing your request. Error reference: ${errorReference}`,
      name:    'UnknownError',
    });
  }
}
