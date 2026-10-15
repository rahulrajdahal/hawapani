---
name: security-audit
description: Security assessment protocol verifying zero secret leakage, input sanitization, safe routing, and HTTP headers.
---

# Security Audit Workflow

## Purpose
Enforce zero-trust boundaries around external weather APIs, protect client privacy, and eliminate web vulnerabilities.

## Audit Checklist
1. **Secret & Key Hygiene**:
   - Inspect client components and bundles: verify that `WEATHER_API_KEY` is NEVER referenced client-side or exposed as `NEXT_PUBLIC_WEATHER_API_KEY`.
   - Verify that test fixtures, Storybook files, and logs do not contain production secrets.
2. **Input Sanitization & Length Caps**:
   - Verify that `q` parameter inputs in `SearchInput` and Route Handlers are trimmed, length-capped, and sanitized before upstream transmission.
3. **HTML & Injection Protection**:
   - Check for absence of `dangerouslySetInnerHTML` or unescaped string injection.
   - Verify safe URL creation without open redirect vulnerabilities.
4. **HTTP Security Headers**:
   - Verify that `next.config.ts` or middleware implements Content Security Policy, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Strict-Transport-Security, and Referrer-Policy.
