/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        dirs: [
            'app', 'application', 'components', 'core', 'reader', 'viewer',
        ],
    },
}

module.exports = nextConfig
