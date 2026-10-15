# Architecture Rules

## Pragmatic Architecture
- This is a small, focused weather application. Use clean, pragmatic architecture appropriate to its scope.
- Avoid unnecessary architectural layers, speculative enterprise patterns, microservices, databases, Kubernetes, or complex state managers unless actual requirements justify them.
- Before adding an architectural layer, ask:
  > What concrete problem does this layer solve today?
  If there is no strong answer, do not add it.

## Layer Boundaries & Principles
- Follow established Next.js App Router conventions.
- Keep external service boundaries isolated:
  ```
  UI Components -> Application Layer / Hooks -> Route Handlers / Service -> WeatherAPI
  ```
- WeatherAPI credentials must strictly remain behind the server boundary.
- Do not allow provider-specific data structures to unnecessarily bleed across presentation components; use typed adapters/mappers.
