## 2025-02-18 - Restrict Local Proxy CORS
**Vulnerability:** Default `cors()` allows all origins, exposing local proxy to external sites via browser.
**Learning:** Local development tools often run on `localhost` or `127.0.0.1`.
**Prevention:** Use `origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/` to strictly limit access to local origins.
