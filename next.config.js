const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    '/*': [
      './tooling/command-center/dist/**/*',
      './tooling/proposal-command/dist/**/*',
      './tooling/sales-command/dist/**/*',
    ],
  },
  outputFileTracingExcludes: {
    '/*': [
      './tooling/ML-SIGNAL-STACK-TNCC/**',
      './tooling/ML-EIA-PETROLEUM-INTEL/**',
      './tooling/MOD-PAPERSTACK-PP/**',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: false,
  },
  serverExternalPackages: ['handlebars'],
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/tooling/ML-SIGNAL-STACK-TNCC/**',
        '**/tooling/ML-EIA-PETROLEUM-INTEL/**',
        '**/tooling/MOD-PAPERSTACK-PP/**',
      ],
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || 'true-north-data-strategies-llc',
  project: process.env.SENTRY_PROJECT || 'pipeline-punks-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
