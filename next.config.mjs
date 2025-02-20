/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'smart-recipe-generator.s3.amazonaws.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
                port: '',
            },
        ],
        minimumCacheTTL: 2592000, // Cache for 30 days (in seconds)
        deviceSizes: [320, 420, 768, 1024, 1280, 1440, 1920], // Breakpoints for mobile, tablet, desktop
        imageSizes: [16, 32, 48, 64, 96], // For icons, thumbnails, avatars
    }

};

export default nextConfig;