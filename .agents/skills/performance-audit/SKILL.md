---
name: performance-audit
description: Performance auditing checklist inspecting client bundles, Server Components, request deduplication, and Core Web Vitals.
---

# Performance Audit Workflow

## Purpose
Protect client performance and ensure smooth user experiences across mobile and desktop devices.

## Audit Checklist
1. **Server vs. Client Boundaries**:
   - Verify that components are not marked with `"use client"` unless they strictly consume React hooks or browser APIs.
   - Heavy subtrees (e.g. Recharts graphs, modal dialogs) are code-split via `next/dynamic` where beneficial.
2. **Data Fetching & Deduplication**:
   - Weather queries route through Route Handlers with caching headers.
   - Repeated forecast requests within 30 minutes are cached rather than refetched.
3. **Core Web Vitals Metrics**:
   - **CLS (Cumulative Layout Shift)**: Target 0. Verify skeleton loaders mirror real cards in dimension.
   - **FCP (First Contentful Paint)**: Target < 1.2s. Font optimization and critical CSS in place.
   - **INP (Interaction to Next Paint)**: Target < 200ms. Search inputs debounced (300ms).
4. **Asset & Image Optimization**:
   - Remote WeatherAPI weather condition icons use `next/image` with remote patterns.
   - Local SVGs and icons are optimized and inline where appropriate.
