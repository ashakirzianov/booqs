import { pgSyncWorker } from '@/backend/sync'


async function main() {
    console.info('Running script in Next.js context')
    console.info('Running pg sync: S3 to Store...')
    const total = await pgSyncWorker({
        batchSize: 100,
    })
    console.info(`Finished running pg sync: ${total}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})