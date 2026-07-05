/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        rules: {
            '*.graphql': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
    async headers() {
        const headers = [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ]
        if (process.env.NODE_ENV === 'production') {
            headers.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' })
        }
        return [{
            source: '/(.*)',
            headers,
        }, {
            // Apple requires application/json for the associated-domains
            // file (native app passkeys); nosniff above makes it mandatory.
            source: '/.well-known/apple-app-site-association',
            headers: [
                { key: 'Content-Type', value: 'application/json' },
            ],
        }]
    },
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)
