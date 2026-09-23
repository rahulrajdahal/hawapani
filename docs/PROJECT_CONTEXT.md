# Project Context

## Purpose & Vision

**hawapani** is a modern, responsive, and privacy-first weather Progressive Web Application (PWA) built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

The app empowers users to monitor atmospheric conditions across the globe with precision:

- Real-time meteorological metrics (temperature, humidity, wind, UV index, air quality US-EPA metrics).
- 24-hour continuous rolling hourly forecast and Bézier trendline chart.
- 7-day extended daily forecast with precipitation probabilities and temperature ranges.
- Quick-access location bookmarking via browser `localStorage`.
- Multi-city side-by-side comparative analysis.
- Offline support: cached weather forecasts for offline review, plus an offline fallback weather game when no cache exists.

## Current Scope & Architecture

hawapani is a lightweight, frontend-focused Next.js web application.

- **Location State Model**: Single route with query parameter synchronization:
  `/?q=<location>`
- The application intentionally does **NOT** require:
  - User accounts or authentication
  - Relational or NoSQL databases
  - Microservices or complex message brokers
  - Enterprise Domain-Driven Design (DDD) layers
  - Dedicated external backend services
  - Kubernetes or complex Infrastructure-as-Code (IaC)

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime & UI**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 with glassmorphic atmospheric tokens
- **Component Primitives**: Radix UI encapsulated via dedicated project wrappers
- **Data Source**: WeatherAPI (`forecast.json`, `search.json`) via Route Handlers
- **Component Workbench**: Storybook 10 with `@storybook/nextjs-vite` and axe-based accessibility addon
- **Testing**: Vitest v5 (unit & utilities) and Cypress 16 (end-to-end and component tests)
- **Analytics**: PostHog (privacy-respecting analytics)
- **Deployment**: Vercel
