const CORS_ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '';

export function internalServerError(body: Record<string, unknown> = { message: 'Internal server error' }) {
  return {
    statusCode: 500,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}

export function badRequest(body: Record<string, unknown>) {
  return {
    statusCode: 400,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}

export function notFound(body: Record<string, unknown>) {
  return {
    statusCode: 404,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}

export function conflict(body: Record<string, unknown>) {
  return {
    statusCode: 409,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}

export function created(body: Record<string, unknown>) {
  return {
    statusCode: 201,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}

export function ok(body: Record<string, unknown>) {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN,
      'Content-Type': 'application/json',
    },
  };
}
