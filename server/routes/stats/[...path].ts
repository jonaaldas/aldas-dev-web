import {
  createError,
  defineEventHandler,
  getProxyRequestHeaders,
  getRequestURL,
  proxyRequest,
} from 'h3';

const PROXY_BASE_PATH = '/stats';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const proxyTarget = config.umamiProxyTarget;

  if (!proxyTarget) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Umami proxy target',
    });
  }

  const sourceUrl = getRequestURL(event);
  const targetOrigin = new URL(proxyTarget);
  const proxiedPath = sourceUrl.pathname.replace(PROXY_BASE_PATH, '') || '/';
  const targetUrl = new URL(proxiedPath, targetOrigin);
  targetUrl.search = sourceUrl.search;

  const headers = getProxyRequestHeaders(event);
  headers.host = targetOrigin.host;
  headers['x-forwarded-host'] = sourceUrl.host;
  headers['x-forwarded-proto'] = sourceUrl.protocol.replace(':', '');

  return proxyRequest(event, targetUrl.toString(), { headers });
});
