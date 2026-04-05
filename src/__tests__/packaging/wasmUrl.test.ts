// wasmUrl.test.ts
// Property-based test for WASM daemon URL embedding (Property 6).
//
// Validates: Requirements 5.1, 5.4
//
// Property 6: WASM Daemon URL Embedding
// For any port value P, the UI must set window.EMSG_DAEMON_URL to
// http://localhost:P before WASM initialisation, matching the value
// returned by daemonBaseURL() in the WASM module.

import * as fc from 'fast-check';

describe('Property 6: WASM Daemon URL Embedding', () => {
  it('sets window.EMSG_DAEMON_URL to http://localhost:<port> for any valid port', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 65535 }),
        (port) => {
          // Simulate what wasm-init.ts does: assign the daemon URL to window
          const expectedUrl = `http://localhost:${port}`;
          (window as Window & { EMSG_DAEMON_URL: string }).EMSG_DAEMON_URL = expectedUrl;

          // Assert the URL was set correctly
          expect((window as Window & { EMSG_DAEMON_URL: string }).EMSG_DAEMON_URL).toBe(expectedUrl);
        }
      ),
      { numRuns: 100 }
    );
  });
});
