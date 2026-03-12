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

## 2025-03-02 - Rate Limiting Memory Leak (DoS)
**Vulnerability:** In-memory rate limiting using a Map without an eviction strategy allows the Map to grow indefinitely as new IPs connect, eventually leading to a Denial of Service (DoS) via memory exhaustion.
**Learning:** Even simple single-instance tools need periodic cleanup logic.
**Prevention:** Always implement a TTL eviction or periodic background cleanup (e.g., via `setInterval`) for in-memory caches and rate limiter state.

## 2026-02-28 - HTTP Parameter Pollution in API Service
**Vulnerability:** Construction of API URLs using string interpolation leaves them vulnerable to HTTP Parameter Pollution if inputs contain unescaped query string characters (`&`, `=`).
**Learning:** This could allow a malicious user to overwrite or inject query parameters, potentially breaking the application or gaining unintended access.
**Prevention:** Always use `URLSearchParams` to safely encode query parameters and `encodeURIComponent` for URL path components instead of raw string interpolation.

## 2025-02-18 - API Key Shoulder Surfing Prevention
**Vulnerability:** Input fields for sensitive information like API keys were set to `type="text"`, exposing them to shoulder surfing or screen sharing leaks. They were also prone to being saved in browser autocomplete caches.
**Learning:** Any input field handling sensitive tokens, passwords, or keys must use the `password` type to mask the input by default.
**Prevention:** Always use `<input type="password" autoComplete="off" />` when requesting sensitive credentials from the user on the client-side.
## 2025-02-19 - Frontend API Fetch Timeout
**Vulnerability:** External fetch calls without timeouts can hang indefinitely in the frontend, causing UI lockups and resource exhaustion.
**Learning:** Even on the client side, external API calls need a timeout limit (using `AbortController`) to ensure the application remains responsive if the API fails to respond.
**Prevention:** Implement a helper function like `fetchWithTimeout` to wrap `fetch` with a `setTimeout` and `AbortController` for all external API calls.
## 2025-03-02 - External AI SDK Timeout Pattern
**Vulnerability:** External calls to AI providers (like Google Gen AI) without explicit timeouts can hang indefinitely, causing UI lockups and resource exhaustion.
**Learning:** SDKs often do not set strict default timeouts or they may be very long. The `@google/genai` SDK allows configuring `httpOptions: { timeout: ms }`.
**Prevention:** Always configure an explicit timeout (e.g., 10s) when initializing external AI SDK clients to prevent indefinite hanging.
## 2025-03-02 - Missing Input Length Limits (DoS)
**Vulnerability:** Frontend input fields (API keys, search queries) lacked length limits (`maxLength`), allowing users or automated scripts to paste massive strings, potentially causing client-side memory exhaustion or sending oversized payloads to the backend API.
**Learning:** Even if the backend validates payload sizes, the frontend should act as the first line of defense to prevent oversized inputs from being processed or stored in browser memory (e.g., localStorage).
**Prevention:** Always add sensible `maxLength` attributes to all HTML `<input>` elements (e.g. `maxLength={100}` for tokens, `maxLength={50}` for search fields).

## 2026-03-08 - Information Disclosure via Server Headers
**Vulnerability:** Express applications by default send the `X-Powered-By: Express` header, which exposes the technology stack to potential attackers. Additionally, the lack of a strict `Referrer-Policy` can leak sensitive URLs to third-party sites via the Referer header.
**Learning:** Default framework settings often favor developer convenience over security by disclosing internal framework details, assisting attackers in profiling the application for specific framework vulnerabilities.
**Prevention:** Always use `app.disable('x-powered-by')` in Express apps and add `res.setHeader('Referrer-Policy', 'no-referrer')` to global middleware to minimize the attack surface by concealing infrastructure details and protecting user privacy.

## 2026-03-09 - Information Disclosure via Express Default Error Handler
**Vulnerability:** Express 5+ applications by default forward unhandled errors to a built-in error handler that returns HTML containing full stack traces, disclosing internal application structure and paths.
**Learning:** The default behavior of Express when handling undefined routes or thrown errors is not secure for production or even strictly secured development environments, as it leaks information.
**Prevention:** Always add a catch-all 404 handler for undefined routes and a global error-handling middleware (`app.use((err, req, res, next) => { ... })`) at the end of the middleware chain (before `app.listen`) to return generic, safe JSON responses and securely log the actual error on the server side.
## 2026-03-09 - Information Disclosure via Browser Autocomplete Cache
**Vulnerability:** Input fields for search queries were left with default `autoComplete` settings. If a user inadvertently pastes sensitive data (like an API key) into the search bar, it gets saved in the browser's autocomplete history and could be disclosed to other users on the same machine or synced to an unsecured account.
**Learning:** General-purpose text inputs, particularly those in an application handling API keys or financial data, should not cache user input unless explicitly desired, to prevent accidental leakage of mistakenly pasted secrets.
**Prevention:** Always set `autoComplete="off"`, `spellCheck="false"`, and `autoCorrect="off"` on generic text `<input>` elements (e.g., search bars) to prevent the browser from permanently storing or sending potentially sensitive typos/pastes.

## 2026-03-09 - Local Storage Type Confusion and XSS Injection
**Vulnerability:** Arrays returned from `localStorage` using `JSON.parse` were implicitly trusted. If malformed data (such as object configurations instead of strings) was somehow injected or corrupted into the cache, this type confusion could break React components or introduce Cross-Site Scripting (XSS) vectors when the object properties are mapped into the UI.
**Learning:** Never trust the underlying types of elements from deserialized local storage simply because `Array.isArray()` evaluates to true.
**Prevention:** Validate every element in arrays loaded from storage, like checking `parsed.every(item => typeof item === 'string')`, returning defaults if invalid types are encountered.

## 2026-03-09 - Information Disclosure via Frontend Error Handling
**Vulnerability:** The application was catching exceptions from the `@google/genai` AI analysis module and displaying `err.message` directly in the UI. If the API key is invalid or another network issue occurs, these raw error messages can sometimes expose sensitive context or internal parameters to the end user.
**Learning:** Even on the client side, raw error messages from external libraries or SDKs should never be blindly trusted and rendered directly in the DOM, as they may contain sensitive information intended only for developer debugging.
**Prevention:** Always log specific error details to the console using `console.error` for debugging, but set a generic, safe error message (e.g., "Analysis Error: Failed to generate insights.") to be displayed in the UI to prevent potential information leakage.
