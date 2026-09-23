/** @type {import('next').NextConfig} */


const securityHeaders = [
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
    },
    {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://cdn.weatherapi.com; font-src 'self' data:; connect-src 'self' https://api.weatherapi.com https://cdn.weatherapi.com https://*.posthog.com https://us.i.posthog.com https://eu.i.posthog.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
    },
];

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.weatherapi.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;

