import { syncWithGutenberg } from '@/backend/sync'
import { processEpubs } from './epub'

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

async function main() {
    const options = parseCliOptions()
    if (options.switches.worker === 'pgsync') {
        console.info('Running pg sync: S3 to Store...')
        await syncWithGutenberg({
            skipExistingS3: options.switches['skip-s3'] === 'true',
        })
    } else {
        await processEpubs(options)
    }

    console.info(`Finished running pg sync`)
}

export type CliOptions = {
    switches: Record<string, string>,
    commands: string[],
}
function parseCliOptions(): CliOptions {
    const args = process.argv.slice(2)
    const options: CliOptions = {
        switches: {},
        commands: [],
    }
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=')
            const name = key.substring('--'.length)
            options.switches[name] = value ?? 'true'
        } else {
            options.commands.push(arg)
        }
    }
    return options
}