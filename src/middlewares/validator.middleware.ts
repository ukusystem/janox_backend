import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';

export const requestDataValidator =
  (validatorSchema: { bodySchema?: AnyZodObject; querySchema?: AnyZodObject; paramSchema?: AnyZodObject }, requestDataTypes: { hasBody?: boolean; hasQuery?: boolean; hasParam?: boolean } = { hasBody: false, hasParam: false, hasQuery: false }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hasBody, hasParam, hasQuery } = requestDataTypes;
      const { bodySchema, paramSchema, querySchema } = validatorSchema;
      // Validate  requests
      if (hasBody && bodySchema) await bodySchema.parseAsync(Object.keys(req.body).length === 0 ? undefined : req.body);
      if (hasParam && paramSchema) await paramSchema.parseAsync(Object.keys(req.params).length === 0 ? undefined : req.params);
      if (hasQuery && querySchema) await querySchema.parseAsync(Object.keys(req.query).length === 0 ? undefined : req.query);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // return res.status(400).send({ msg: error.issues[0].message } );
        return res.status(400).json(error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
      }
      // If error is not from zod then return generic error message
      return res.status(500).send('Error making request, contact support');
    }
  };

export enum ValidationKeys {
  Query = 'query',
  Params = 'params',
  Body = 'body',
}

type SchemaOptions<TBody, TParams, TQuery> = {
  body?: ZodType<TBody>;
  params?: ZodType<TParams>;
  query?: ZodType<TQuery>;
};

type ErrorItem = { type: ValidationKeys; errors: ZodError };

export const requestValidator = <TBody, TParams, TQuery>(schemas: SchemaOptions<TBody, TParams, TQuery>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ErrorItem[] = [];

    if (schemas.params) {
      const parseResult = schemas.params.safeParse(req.params);
      if (!parseResult.success) {
        errors.push({ type: ValidationKeys.Params, errors: parseResult.error });
      }
    }

    if (schemas.query) {
      const parseResult = schemas.query.safeParse(req.query);
      if (!parseResult.success) {
        errors.push({ type: ValidationKeys.Query, errors: parseResult.error });
      }
    }

    if (schemas.body) {
      const parseResult = schemas.body.safeParse(req.body);
      if (!parseResult.success) {
        errors.push({ type: ValidationKeys.Body, errors: parseResult.error });
      }
    }

    if (errors.length > 0) {
      sendErrors(errors, res);
    } else {
      next();
    }
  };
};

export const sendErrors = (errors: Array<ErrorItem>, res: Response) => {
  return res.status(400).send({
    errors: errors.map((error) => {
      const errorList = error.errors.issues.map((issue) => ({ message: issue.message, code: issue.code }));
      return { type: error.type, errors: errorList };
    }),
  });
};
