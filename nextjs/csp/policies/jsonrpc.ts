import type CspDev from 'csp-dev';

export function jsonrpc(): CspDev.DirectiveDescriptor {

  return {
    'connect-src': [
      'https://*.cross-nexus.com:*',
    ],
  };
}
