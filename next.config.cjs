/** @type {import('next').NextConfig} */
const clerkConfig = require('./clerk.config.js');

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  env: {
    NEXT_PUBLIC_CLERK_FRONTEND_API: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL
  },
  clerk: clerkConfig,
  webpack: (config, { isServer }) => {
    // Log webpack configuration
    console.log('Webpack config:', JSON.stringify(config, null, 2));
    
    if (!isServer) {
      // Add polyfills for crypto and util
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        util: require.resolve('util/')
      };
    }
    
    return config;
  },
  onDemandEntries: {
    // Increase the timeout for debugging purposes
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}