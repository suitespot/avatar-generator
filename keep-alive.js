export function setKeepAlive(server) {
  const keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS, 10) || 240000;
  const headersTimeout = keepAliveTimeout + 1000;
  server.keepAliveTimeout = keepAliveTimeout;
  server.headersTimeout = headersTimeout;
  log.info('KeepAliveTimeout: ' + server.keepAliveTimeout + 'ms');
}
