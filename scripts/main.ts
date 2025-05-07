import { syncWithGutenberg } from '@/backend/sync'


async function main() {
    console.info('Running script in Next.js context')
    console.info('Running pg sync: S3 to Store...')
    await syncWithGutenberg()
    console.info(`Finished running pg sync`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})