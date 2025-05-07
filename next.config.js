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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)
