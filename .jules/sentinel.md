## 2025-02-18 - Restrict Local Proxy CORS
**Vulnerability:** Default `cors()` allows all origins, exposing local proxy to external sites via browser.
**Learning:** Local development tools often run on `localhost` or `127.0.0.1`.
**Prevention:** Use `origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/` to strictly limit access to local origins.

## 2025-02-18 - External API Timeout Pattern
**Vulnerability:** External `fetch` calls without timeouts can hang indefinitely, causing resource exhaustion (DoS).
**Learning:** `node-fetch` requires an explicit `AbortController` signal to handle timeouts; it does not have a built-in timeout option like some other libraries.
**Prevention:** Always wrap external API calls with an `AbortController` and a `setTimeout` (e.g., 5s), ensuring the timeout is cleared in a `finally` block.

## 2025-02-18 - In-Memory Rate Limiting
**Vulnerability:** Unrestricted access to external API proxies allows abuse and potential IP bans.
**Learning:** For simple single-instance development servers, an in-memory `Map<string, number[]>` is sufficient for rate limiting without external dependencies like Redis.
**Prevention:** Implement middleware that tracks request timestamps per IP and rejects excessive requests (e.g., >20/min) with HTTP 429.

## 2026-02-28 - HTTP Parameter Pollution in API Service
**Vulnerability:** Construction of API URLs using string interpolation leaves them vulnerable to HTTP Parameter Pollution if inputs contain unescaped query string characters (`&`, `=`).
**Learning:** This could allow a malicious user to overwrite or inject query parameters, potentially breaking the application or gaining unintended access.
**Prevention:** Always use `URLSearchParams` to safely encode query parameters and `encodeURIComponent` for URL path components instead of raw string interpolation.
