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
        ],
    }

};

export default nextConfig;
