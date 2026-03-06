/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: 'localhost' },
        ],
    },
    experimental: {
        serverActions: { allowedOrigins: ['localhost:3001'] },
    },
};

module.exports = nextConfig;
