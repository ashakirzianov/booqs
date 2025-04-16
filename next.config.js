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
            'graphql', 'parser', 'reader', 'viewer',
        ],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.graphql$/,
            type: 'asset/source', // tells webpack to treat the file as a string
        })
        return config
    },
}

module.exports = nextConfig
