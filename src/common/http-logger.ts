import { Logger } from '@nestjs/common';
import type * as openidClient from 'openid-client';

const logger = new Logger('OAuth HTTP');
const originalFetch = global.fetch;

export async function loggedFetch(
  url: string,
  options?: openidClient.CustomFetchOptions | RequestInit,
): Promise<Response> {
  const method = options?.method || 'GET';
  const parsedUrl = new URL(url);

  logger.log(`→ ${method} ${parsedUrl.host}${parsedUrl.pathname}`);

  // Log query parameters
  if (parsedUrl.search) {
    logger.debug(`  query: ${parsedUrl.search.substring(1)}`);
  }

  // Log request body (for form data and JSON)
  if (options?.body) {
    if (options.body instanceof URLSearchParams) {
      const paramEntries = Array.from(options.body.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('\n    ');
      logger.debug(`  body:\n    ${paramEntries}`);
    } else if (typeof options.body === 'string') {
      // JSON or other string content
      logger.debug(`  body: ${options.body}`);
    } else {
      // Other types (Uint8Array, etc.)
      logger.debug(`  body: [${options.body.constructor?.name || 'unknown'}]`);
    }
  }

  // @ts-expect-error - CustomFetchOptions is compatible with RequestInit
  const response = await originalFetch(url, options);

  logger.log(`← ${response.status} ${response.statusText}`);

  return response;
}
