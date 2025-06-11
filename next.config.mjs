// next.config.mjs
/** @type {import('next').NextConfig} */

const isE2E = process.env.E2E === '1';

const nextConfig = {
    images: {
        // ⬇️ When running Cypress in the sandbox we don’t want Next’s proxy
        unoptimized: isE2E,

        // The rest only matters in normal dev / prod builds
        remotePatterns: isE2E ? [] : [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',        // <- required
            },
            {
                protocol: 'https',
                hostname: 'smart-recipe-generator.s3.amazonaws.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
                pathname: '/**',
            },
        ],
        minimumCacheTTL: 2_592_000,          // 30 days
        deviceSizes: [320, 420, 768, 1024, 1280, 1440, 1920],
        imageSizes: [16, 32, 48, 64, 96],
    },
};

export default nextConfig;