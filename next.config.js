/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        dirs: [
            'app', 'application', 'backend', 'data', 'components', 'core', 'reader', 'viewer',
        ],
    },
}

module.exports = nextConfig
