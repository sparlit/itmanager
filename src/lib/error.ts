import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

// Standard error response
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Validation error response
export function validationError(error: ZodError) {
  const messages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
  return NextResponse.json({ error: 'Validation failed', details: messages }, { status: 400 });
}

// Not found response
export function notFound(resource: string) {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

// Unauthorized response
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

// Forbidden response
export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

// Server error response
export function serverError(message = 'Internal server error') {
  logger.error({ error: message }, 'Server error');
  return NextResponse.json({ error: message }, { status: 500 });
}

// Parse and validate request body
export async function parseBody<T>(request: Request, schema: { parse: (data: unknown) => T }) {
  try {
    const body = await request.json();
    return { data: schema.parse(body) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: validationError(error) };
    }
    return { error: errorResponse('Invalid request body') };
  }
}

// Wrap async handler with error handling
export function withErrorHandling(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      logger.error({ err: error, path: request.url }, 'Handler error');
      return serverError();
    }
  };
}

// APIRoute wrapper with common functionality
export function createApiRoute(config: {
  GET?: (request: Request) => Promise<NextResponse>;
  POST?: (request: Request) => Promise<NextResponse>;
  PATCH?: (request: Request) => Promise<NextResponse>;
  DELETE?: (request: Request) => Promise<NextResponse>;
}) {
  return async (request: Request) => {
    const method = request.method;
    
    try {
      if (method === 'GET' && config.GET) return await config.GET(request);
      if (method === 'POST' && config.POST) return await config.POST(request);
      if (method === 'PATCH' && config.PATCH) return await config.PATCH(request);
      if (method === 'DELETE' && config.DELETE) return await config.DELETE(request);
      
      return errorResponse('Method not allowed', 405);
    } catch (error) {
      if (error instanceof ZodError) {
        return validationError(error);
      }
      logger.error({ err: error, method, path: request.url }, 'API route error');
      return serverError();
    }
  };
}