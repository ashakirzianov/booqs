/** @type {import('next').NextConfig} */
const nextConfig = {
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
