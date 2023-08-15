module.exports = {
    client: {
        // service: 'booqs-back',
        name: 'booqs-back',
        url: `${process.env.NEXT_PUBLIC_BACKEND}/graphql`,
        includes: ['./app/**/*.ts'],
    },
}