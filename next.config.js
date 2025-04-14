/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    eslint: {
        dirs: [
            'app', 'application',
            'backend',
            'components', 'core',
            'data',
            'parser',
            'reader',
            'viewer',
        ],
    },
}

module.exports = nextConfig
