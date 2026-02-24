## 2025-02-18 - Restrict Local Proxy CORS
**Vulnerability:** Default `cors()` allows all origins, exposing local proxy to external sites via browser.
**Learning:** Local development tools often run on `localhost` or `127.0.0.1`.
**Prevention:** Use `origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/` to strictly limit access to local origins.

## 2025-02-18 - External API Timeout Pattern
**Vulnerability:** External `fetch` calls without timeouts can hang indefinitely, causing resource exhaustion (DoS).
**Learning:** `node-fetch` requires an explicit `AbortController` signal to handle timeouts; it does not have a built-in timeout option like some other libraries.
**Prevention:** Always wrap external API calls with an `AbortController` and a `setTimeout` (e.g., 5s), ensuring the timeout is cleared in a `finally` block.
